import { AdminListPage } from '@/components/admin/admin-list-page';

export default function AdminPaymentsPage() {
  return <AdminListPage resource="payments" title="Payment Oversight" description="Monitor platform-wide orders, refunds, and provider state." />;
}
