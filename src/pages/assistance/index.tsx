import Layout from "@/components/Layout";
import useSWR from "swr";
import Link from "next/link";
import { useSession } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AssistanceGallery() {
  const { data: session } = useSession();
  const { data, error } = useSWR("/api/assistance", fetcher);

  if (!session) return <p className="p-6">Please sign in to view this page.</p>;
  if (session.user.role !== "SUPERVISOR" && session.user.role !== "ADMIN")
    return <p className="p-6 text-red-600">Access denied.</p>;
  if (error) return <p className="p-6 text-red-600">Error loading tasks.</p>;
  if (!data) return <p className="p-6">Loading flagged tasks...</p>;

  const tasks = data.flaggedTasks || [];

  return (
    <Layout title="Assistance Gallery">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">🛠 Assistance Gallery</h1>

        {tasks.length === 0 ? (
          <p className="text-gray-600">No flagged tasks right now 🎉</p>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task: any) => (
              <li
                key={task.id}
                className="border rounded-md p-4 shadow-sm bg-white hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">
                      Project: <span className="font-medium">{task.project.title}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Flagged by: {task.assignee?.name || "Unknown user"} (
                      {task.assignee?.email || "N/A"})
                    </p>
                  </div>
                  <Link
                    href={`/tasks/${task.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Task →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}