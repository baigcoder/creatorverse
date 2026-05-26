import { AdminListPage } from '@/components/admin/admin-list-page';

export default function AdminLogsPage() {
  return <AdminListPage resource="logs" title="Audit Logs" description="Inspect sensitive account, auth, and admin actions." />;
}
