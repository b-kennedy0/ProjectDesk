import useSWR from 'swr';
import Layout from '@/components/Layout';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function NotificationsPage() {
  const { data, mutate } = useSWR('/api/notifications', fetcher);

  async function markAllRead() {
    if (!data?.length) return;
    const ids = data.filter((n: any) => !n.read).map((n: any) => n.id);
    if (!ids.length) return;
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, read: true }),
    });
    mutate();
  }

  return (
    <Layout title="Notifications">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <button onClick={markAllRead} className="text-sm border px-3 py-1 rounded-md">Mark all as read</button>
      </div>

      {!data ? (
        <p>Loading…</p>
      ) : data.length === 0 ? (
        <p className="text-gray-600">No notifications.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((n: any) => (
            <li key={n.id} className={`border rounded-md p-3 ${n.read ? '' : 'bg-yellow-50'}`}>
              <div className="text-sm">
                <span className="font-medium">{n.type.replace('_', ' ')}</span>: {n.message}
              </div>
              <a className="text-xs text-blue-700 underline" href={`/projects/${n.projectId}`}>View project</a>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}