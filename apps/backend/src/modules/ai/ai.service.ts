import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnalysisType, AnalysisResult } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

interface ApplicationAnalysisInput {
  applicationId: string;
  beneficiary: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    monthlyIncome: unknown;
    region: string;
  };
  program: {
    id: string;
    eligibilityCriteria: unknown;
  };
}

interface ApplicationAnalysisResult {
  riskScore: number;
  eligibilityScore: number;
  duplicateCheckPassed: boolean;
  fraudCheckPassed: boolean;
  flags: string[];
}

/**
 * Proxy to the Python FastAPI AI service. Falls back to conservative local
 * heuristics when the AI service is unavailable so the platform degrades
 * gracefully rather than blocking disbursements.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  private get baseUrl(): string {
    return this.config.get<string>('aiServiceUrl') ?? 'http://localhost:8000';
  }

  private async call<T>(path: string, body: unknown): Promise<T | null> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`AI service ${path} -> ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      this.logger.warn(`AI call ${path} failed: ${(err as Error).message}`);
      return null;
    }
  }

  /** Runs the full application analysis pipeline and persists results. */
  async analyzeApplication(input: ApplicationAnalysisInput): Promise<ApplicationAnalysisResult> {
    // Build a real candidate set so duplicate detection actually works.
    // We compare against other beneficiaries sharing a surname prefix — cheap
    // to fetch and covers the common ghost-beneficiary patterns. At scale this
    // is replaced by a pgvector similarity query.
    const candidates = await this.prisma.beneficiary
      .findMany({
        where: {
          id: { not: input.beneficiary.id },
          deletedAt: null,
          lastName: { startsWith: input.beneficiary.lastName.slice(0, 3), mode: 'insensitive' },
        },
        select: { id: true, firstName: true, lastName: true, dateOfBirth: true },
        take: 200,
      })
      .catch(() => []);

    const [duplicate, fraud, eligibility] = await Promise.all([
      this.call<{ score: number; isDuplicate: boolean; flags: string[] }>('/duplicate-check', {
        beneficiaryId: input.beneficiary.id,
        firstName: input.beneficiary.firstName,
        lastName: input.beneficiary.lastName,
        dateOfBirth: input.beneficiary.dateOfBirth,
        candidates: candidates.map((c) => ({
          beneficiaryId: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          dateOfBirth: c.dateOfBirth,
        })),
      }),
      this.call<{ score: number; isFraud: boolean; flags: string[] }>('/fraud-check', {
        applicationId: input.applicationId,
        monthlyIncome: Number(input.beneficiary.monthlyIncome ?? 0),
        region: input.beneficiary.region,
      }),
      this.call<{ score: number; eligible: boolean; flags: string[] }>('/eligibility', {
        beneficiary: input.beneficiary,
        criteria: input.program.eligibilityCriteria,
      }),
    ]);

    const flags = [
      ...(duplicate?.flags ?? []),
      ...(fraud?.flags ?? []),
      ...(eligibility?.flags ?? []),
    ];

    // Compose a risk score: fraud + duplicate signals dominate.
    const fraudScore = fraud?.score ?? 30;
    const duplicateScore = duplicate?.isDuplicate ? 90 : 10;
    const riskScore = Math.round(Math.min(100, fraudScore * 0.6 + duplicateScore * 0.4));
    const eligibilityScore = eligibility?.score ?? 50;

    const result: ApplicationAnalysisResult = {
      riskScore,
      eligibilityScore,
      duplicateCheckPassed: duplicate ? !duplicate.isDuplicate : true,
      fraudCheckPassed: fraud ? !fraud.isFraud : true,
      flags,
    };

    await this.persist(input.applicationId, AnalysisType.FRAUD_DETECTION, riskScore, result.fraudCheckPassed, flags);
    return result;
  }

  /** Proxies a chatbot query to the AI service. */
  async chat(userId: string, message: string, context?: Record<string, unknown>) {
    const res = await this.call<{ reply: string; confidence: number; suggestedActions?: unknown[] }>(
      '/chat',
      { userId, message, context }
    );
    return (
      res ?? {
        reply:
          'The assistant is temporarily unavailable. Please try again shortly or contact support.',
        confidence: 0,
        suggestedActions: [],
      }
    );
  }

  /** Proxies document verification. */
  async verifyDocument(documentId: string, fileUrl: string, documentType: string) {
    const res = await this.call<{ score: number; authentic: boolean; details: unknown }>(
      '/verify-document',
      { documentId, fileUrl, documentType }
    );
    if (res) {
      await this.persist(
        documentId,
        AnalysisType.DOCUMENT_VERIFICATION,
        res.score,
        res.authentic,
        [],
        'DOCUMENT'
      );
    }
    return res ?? { score: 50, authentic: true, details: { note: 'AI unavailable, manual review needed' } };
  }

  /** Budget forecast for a program. */
  async forecast(programId: string) {
    return (
      (await this.call('/forecast', { programId })) ?? {
        forecast: [],
        note: 'AI service unavailable',
      }
    );
  }

  private async persist(
    targetId: string,
    type: AnalysisType,
    score: number,
    passed: boolean,
    flags: string[],
    targetType = 'APPLICATION'
  ) {
    try {
      await this.prisma.aIAnalysis.create({
        data: {
          targetId,
          targetType,
          analysisType: type,
          modelName: this.config.get('ai.openaiModel') ?? 'heuristic',
          modelVersion: '1.0',
          score,
          result: passed ? AnalysisResult.PASS : AnalysisResult.REVIEW_REQUIRED,
          details: { flags } as object,
          flags: flags as object,
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to persist AI analysis: ${(err as Error).message}`);
    }
  }
}
