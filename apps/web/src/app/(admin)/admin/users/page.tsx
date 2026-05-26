import { AdminListPage } from '@/components/admin/admin-list-page';

export default function AdminUsersPage() {
  return <AdminListPage resource="users" title="User Management" description="Search, review, suspend, and restore platform accounts." />;
}
