import { useRouter } from "next/router";
import useSWR from "swr";
import Layout from "@/components/Layout";
import { toast, Toaster } from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TaskDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data, error, mutate } = useSWR(id ? `/api/tasks/${id}` : null, fetcher);

  if (error) return <Layout title="Task"><p>Error loading task.</p></Layout>;
  if (!data) return <Layout title="Task"><p>Loading task...</p></Layout>;

  const task = data.task;

  async function toggleComplete() {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "PUT" });
      if (!res.ok) throw new Error();
      toast.success("Task marked as complete!");
      mutate();
    } catch {
      toast.error("Failed to update task");
    }
  }

  return (
    <Layout title={task.title}>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow">
        <h1 className="text-2xl font-semibold mb-2">{task.title}</h1>
        <p className="text-gray-700 mb-4">{task.description}</p>
        <p className="text-sm text-gray-500 mb-4">
          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
        </p>

        <div className="flex gap-3">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={task.status}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  try {
                    const res = await fetch(`/api/tasks`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: task.id, status: newStatus }),
                    });
                    if (!res.ok) throw new Error("Failed to update status");
                    toast.success("Task status updated");
                    mutate();
                  } catch (err) {
                    console.error(err);
                    toast.error("Error updating task status");
                  }
                }}
                className="border rounded px-2 py-1 text-sm bg-white text-gray-700"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <button
            onClick={toggleComplete}
            className={`px-4 py-2 rounded-md ${
              task.status === "done"
                ? "bg-gray-300 text-gray-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {task.status === "done" ? "Completed" : "Mark as Completed"}
          </button>
          <button
            onClick={() => router.push(`/projects/${task.projectId}/tasks`)}
            className="px-4 py-2 border rounded-md"
          >
            Back to Tasks
          </button>
        </div>

        <Toaster position="bottom-right" />
      </div>
    </Layout>
  );
}