import { AdminListPage } from '@/components/admin/admin-list-page';

export default function AdminModerationPage() {
  return <AdminListPage resource="moderation" title="Moderation Queue" description="Review recent community posts and author context." />;
}
