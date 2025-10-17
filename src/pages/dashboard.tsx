import ProjectForm from "@/components/ProjectForm";
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import useSWR from "swr";
import Layout from "@/components/Layout";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const [category, setCategory] = useState("all");
  const { data } = useSWR(
    category === "all" ? "/api/projects" : `/api/projects?category=${category}`,
    fetcher
  );

  if (!data) return <Layout title="Dashboard"><p>Loading…</p></Layout>;

  return (
    <Layout title="Dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <div className="flex items-center gap-2">
          <select
            className="border rounded-md px-3 py-1 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All</option>
            <option value="student-project">Student Projects</option>
            <option value="collaboration">Collaborations</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <ProjectForm onCreated={() => mutate()} />
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {data.map((p: any) => {
          const progress = (() => {
            if (!p.startDate || !p.endDate) return 0;
            const now = new Date().getTime();
            const start = new Date(p.startDate).getTime();
            const end = new Date(p.endDate).getTime();
            return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
          })();

          const progressColor =
            progress < 70 ? "bg-green-500" : progress < 90 ? "bg-yellow-500" : "bg-red-500";

          const assignedPeople = [
  ...(p.students?.map((s: any) => s.name) || []),
  ...(p.collaborators?.map((c: any) => c.name) || []),
];

const supervisorName = p.supervisor?.name ? ` (Supervisor: ${p.supervisor.name})` : "";

const assignedText = assignedPeople.length
  ? `${assignedPeople.join(", ")}${supervisorName}`
  : p.supervisor?.name
  ? `Supervisor: ${p.supervisor.name}`
  : "Unassigned";

          return (
            <li
              key={p.id}
              className="border rounded-md p-4 hover:bg-gray-50 transition flex flex-col justify-between"
            >
              <a href={`/projects/${p.id}`} className="block">
                <div className="flex justify-between items-start">
                  <h2 className="font-medium text-lg">{p.title}</h2>
                  {p.category && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {p.category.replace("-", " ")}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mt-1 truncate">{assignedText}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {p.startDate
                    ? new Date(p.startDate).toLocaleDateString()
                    : "?"}{" "}
                  —{" "}
                  {p.endDate
                    ? new Date(p.endDate).toLocaleDateString()
                    : "?"}
                </p>

                <div className="h-2 bg-gray-200 rounded-full mt-2">
                  <div
                    className={`h-2 rounded-full ${progressColor}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
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