import {
  LayoutDashboard,
  FileText,
  Wallet,
  Bell,
  MessageCircle,
  FolderKanban,
  Users,
  FileCheck,
  Siren,
  QrCode,
  Receipt,
  Search,
  Flag,
  FileBarChart,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const beneficiaryNav: NavItem[] = [
  { label: 'Overview', href: '/beneficiary', icon: LayoutDashboard },
  { label: 'Programs', href: '/beneficiary/programs', icon: FileText },
  { label: 'My Wallet', href: '/beneficiary/wallet', icon: Wallet },
  { label: 'Assistant', href: '/beneficiary/assistant', icon: MessageCircle },
  { label: 'Notifications', href: '/beneficiary/notifications', icon: Bell },
];

export const adminNav: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Programs', href: '/admin/programs', icon: FolderKanban },
  { label: 'Applications', href: '/admin/applications', icon: FileCheck },
  { label: 'Beneficiaries', href: '/admin/beneficiaries', icon: Users },
  { label: 'Disaster Mode', href: '/admin/disaster', icon: Siren },
];

export const merchantNav: NavItem[] = [
  { label: 'Overview', href: '/merchant', icon: LayoutDashboard },
  { label: 'Receive Payment', href: '/merchant/qr', icon: QrCode },
  { label: 'Transactions', href: '/merchant/transactions', icon: Receipt },
  { label: 'Wallet', href: '/merchant/wallet', icon: Wallet },
];

export const auditorNav: NavItem[] = [
  { label: 'Overview', href: '/auditor', icon: LayoutDashboard },
  { label: 'Transactions', href: '/auditor/transactions', icon: Search },
  { label: 'Flagged', href: '/auditor/flagged', icon: Flag },
  { label: 'Anomalies', href: '/auditor/anomalies', icon: ShieldAlert },
  { label: 'Reports', href: '/auditor/reports', icon: FileBarChart },
];
