dashboard.tsx
```tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import useSWR from 'swr';
import Layout from '@/components/Layout';
import ProjectForm from '@/components/ProjectForm';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Dashboard() {
  const { data, mutate } = useSWR('/api/projects', fetcher);

  return (
    <Layout title="Dashboard">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Your Projects</h1>
        <ProjectForm onCreated={() => mutate()} />
      </div>

      {!data ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-600">No projects yet. Create your first project.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((p: any) => (
            <li key={p.id} className="border rounded-md p-4">
              <div className="font-medium">{p.title}</div>
              {p.description && <div className="text-sm text-gray-600">{p.description}</div>}
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    return { redirect: { destination: '/api/auth/signin', permanent: false } };
  }
  return { props: {} };
};
```