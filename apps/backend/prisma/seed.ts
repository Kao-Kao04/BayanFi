/**
 * BayanFi database seed.
 * Creates demo users across all roles, a verified organization, active
 * programs, merchants, and sample beneficiaries for demos and local dev.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient, UserRole, OrganizationType, OrganizationStatus, OrganizationMemberRole, ProgramType, ProgramStatus, MerchantCategory, MerchantStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Keypair } from 'stellar-sdk';

// Load the root .env (three levels up from apps/backend/prisma) so the seed
// works regardless of the cwd it is invoked from.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

/** Generates a Stellar keypair and funds it on testnet via Friendbot so the
 *  organization has a real, explorer-verifiable on-chain funding wallet. */
async function provisionOnChainWallet(): Promise<string | null> {
  try {
    const kp = Keypair.random();
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(kp.publicKey())}`);
    return res.ok ? kp.publicKey() : null;
  } catch {
    return null;
  }
}

async function main() {
  console.log('Seeding BayanFi database...');
  const passwordHash = await bcrypt.hash('BayanFi@2026', 10);

  // --- Users ---
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@bayanfi.io' },
    update: {},
    create: { email: 'admin@bayanfi.io', passwordHash, role: UserRole.SUPER_ADMIN, isEmailVerified: true },
  });

  const orgAdmin = await prisma.user.upsert({
    where: { email: 'dswd.admin@bayanfi.io' },
    update: {},
    create: { email: 'dswd.admin@bayanfi.io', passwordHash, role: UserRole.ORG_ADMIN, isEmailVerified: true },
  });

  const auditor = await prisma.user.upsert({
    where: { email: 'auditor@bayanfi.io' },
    update: {},
    create: { email: 'auditor@bayanfi.io', passwordHash, role: UserRole.AUDITOR, isEmailVerified: true },
  });

  const beneficiaryUser = await prisma.user.upsert({
    where: { email: 'juan@bayanfi.io' },
    update: {},
    create: { email: 'juan@bayanfi.io', passwordHash, role: UserRole.BENEFICIARY, isEmailVerified: true },
  });

  const merchantUser = await prisma.user.upsert({
    where: { email: 'store@bayanfi.io' },
    update: {},
    create: { email: 'store@bayanfi.io', passwordHash, role: UserRole.MERCHANT, isEmailVerified: true },
  });

  // --- Organization (idempotent) ---
  let org = await prisma.organization.findFirst({
    where: { registrationNumber: 'GOV-2026-DSWD' },
  });
  if (!org) {
    const stellarPublicKey = await provisionOnChainWallet();
    org = await prisma.organization.create({
      data: {
        name: 'Department of Social Welfare and Development',
        type: OrganizationType.GOVERNMENT,
        registrationNumber: 'GOV-2026-DSWD',
        contactEmail: 'contact@dswd.gov.ph',
        status: OrganizationStatus.VERIFIED,
        verifiedAt: new Date(),
        stellarPublicKey,
        members: {
          create: [{ userId: orgAdmin.id, role: OrganizationMemberRole.ADMIN }],
        },
      },
    });
  } else if (!org.stellarPublicKey) {
    // Backfill an on-chain wallet for an org seeded before this change.
    const stellarPublicKey = await provisionOnChainWallet();
    if (stellarPublicKey) {
      org = await prisma.organization.update({
        where: { id: org.id },
        data: { stellarPublicKey },
      });
    }
  }

  // --- Programs (idempotent: only seed if this org has none) ---
  const existingPrograms = await prisma.program.count({ where: { organizationId: org.id } });
  if (existingPrograms === 0) {
    await prisma.program.createMany({
      data: [
      {
        organizationId: org.id,
        name: 'TES College Scholarship 2026',
        type: ProgramType.SCHOLARSHIP,
        description: 'Tertiary education subsidy for low-income students.',
        budgetAmount: 5_000_000,
        budgetAsset: 'USDC',
        maxAmountPerBeneficiary: 20_000,
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-05-31'),
        status: ProgramStatus.ACTIVE,
        eligibilityCriteria: { age: { min: 16, max: 30 }, income: { max: 300_000 } },
        requiredDocuments: ['NATIONAL_ID', 'PROOF_OF_ENROLLMENT', 'PROOF_OF_INCOME'],
        createdById: orgAdmin.id,
      },
      {
        organizationId: org.id,
        name: 'Typhoon Emergency Cash Assistance',
        type: ProgramType.DISASTER_RELIEF,
        description: 'Rapid relief for typhoon-affected households.',
        budgetAmount: 10_000_000,
        budgetAsset: 'USDC',
        maxAmountPerBeneficiary: 5_000,
        startDate: new Date('2026-07-01'),
        status: ProgramStatus.ACTIVE,
        isEmergency: true,
        eligibilityCriteria: {},
        requiredDocuments: ['NATIONAL_ID'],
        createdById: orgAdmin.id,
      },
      ],
    });
  }

  // --- Beneficiary profile ---
  await prisma.beneficiary.upsert({
    where: { userId: beneficiaryUser.id },
    update: {},
    create: {
      userId: beneficiaryUser.id,
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      dateOfBirth: new Date('2004-03-12'),
      addressLine1: '123 Rizal St',
      barangay: 'Poblacion',
      city: 'Quezon City',
      province: 'Metro Manila',
      region: 'NCR',
      householdSize: 5,
      monthlyIncome: 18_000,
    },
  });

  // --- Merchant profile ---
  await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: {
      userId: merchantUser.id,
      businessName: 'Aling Nena Sari-Sari Store',
      category: MerchantCategory.GROCERY,
      addressLine1: '45 Mabini St',
      city: 'Quezon City',
      province: 'Metro Manila',
      region: 'NCR',
      status: MerchantStatus.ACTIVE,
      verifiedAt: new Date(),
    },
  });

  console.log('Seed complete.');
  console.log('Demo login: admin@bayanfi.io / BayanFi@2026 (and dswd.admin, auditor, juan, store)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
