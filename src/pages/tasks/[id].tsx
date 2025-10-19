import { useRouter } from "next/router";
import useSWR from "swr";
import Layout from "@/components/Layout";
import { toast, Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Helper: status label and color
const statusMap: Record<string, { label: string; color: string }> = {
  todo: { label: "To Do", color: "bg-gray-200 text-gray-800" },
  in_progress: { label: "In Progress", color: "bg-blue-200 text-blue-800" },
  done: { label: "Done", color: "bg-green-200 text-green-800" },
};

function Breadcrumbs({ project, task }: { project?: any; task?: any }) {
  const router = useRouter();
  return (
    <nav className="text-sm mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-gray-500">
        <li>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="hover:underline"
          >
            Dashboard
          </button>
        </li>
        <li>
          <span className="mx-1">/</span>
        </li>
        <li>
          {project ? (
            <button
              type="button"
              onClick={() => router.push(`/projects/${project.id}`)}
              className="hover:underline"
            >
              {project.title}
            </button>
          ) : (
            <span>Project</span>
          )}
        </li>
        <li>
          <span className="mx-1">/</span>
        </li>
        <li className="text-gray-900 font-medium">{task ? task.title : "Task"}</li>
      </ol>
    </nav>
  );
}

function StatusPill({ status }: { status: string }) {
  const map = statusMap[status] || statusMap["todo"];
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${map.color}`}
      style={{ minWidth: 70, textAlign: "center" }}
    >
      {map.label}
    </span>
  );
}

function formatDateTime(dt?: string) {
  if (!dt) return "N/A";
  const d = new Date(dt);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export default function TaskDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data, error, mutate } = useSWR(id ? `/api/tasks/${id}` : null, fetcher);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusSelect, setStatusSelect] = useState("");

  useEffect(() => {
    if (data?.task?.status) {
      setStatusSelect(data.task.status);
    }
  }, [data]);

  if (error) return <Layout title="Task"><p>Error loading task.</p></Layout>;
  if (!data) return <Layout title="Task"><p>Loading task...</p></Layout>;

  const task = data.task;
  const project = data.project || task.project || null;
  const assignedUsers = task.assignedUsers || [];

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

  function openEdit() {
    setEditForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      status: task.status,
      assignedUserIds: assignedUsers.map((u: any) => u.id),
    });
    setEditOpen(true);
  }

  async function handleEditSubmit(e: any) {
    e.preventDefault();
    setEditSaving(true);
    try {
      const res = await fetch(`/api/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          ...editForm,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Task updated");
      setEditOpen(false);
      mutate();
    } catch {
      toast.error("Failed to update task");
    }
    setEditSaving(false);
  }

  // Placeholder: assigned users list
  function AssignedUsers({ users }: { users: any[] }) {
    if (!users?.length) return <span className="text-gray-500">Unassigned</span>;
    return (
      <ul className="space-y-1">
        {users.map((u) => (
          <li key={u.id} className="flex items-center gap-2">
            <span className="font-medium">{u.name}</span>
            <span className="text-xs text-gray-500">&lt;{u.email}&gt;</span>
          </li>
        ))}
      </ul>
    );
  }

  // Compose all project members into a single array for assignment
  const allUsers = project
    ? [
        ...(project.students || []),
        ...(project.collaborators || []),
        ...(project.supervisor ? [project.supervisor] : []),
      ]
    : assignedUsers;

  // Inline status update handler
  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setStatusSelect(newStatus);
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated");
      await mutate();
    } catch {
      toast.error("Failed to update status");
      setStatusSelect(task.status); // revert selection
    }
    setStatusUpdating(false);
  }

  return (
    <Layout title={task.title}>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow">
        {/* Breadcrumb navigation */}
        <Breadcrumbs project={project} task={task} />

        {/* Enhanced task info */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{task.title}</h1>
            <div className="flex items-center gap-2">
              <StatusPill status={task.status} />
              <select
                className="text-xs border rounded px-2 py-1 bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition disabled:opacity-60"
                style={{ minWidth: 90 }}
                value={statusSelect}
                onChange={handleStatusChange}
                disabled={statusUpdating}
                aria-label="Change task status"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              {statusUpdating && (
                <span className="ml-1 text-xs text-gray-400 animate-pulse">Saving...</span>
              )}
            </div>
          </div>
          <p className="text-gray-700">{task.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs uppercase text-gray-400 mb-1">Assigned To</label>
            <AssignedUsers users={assignedUsers} />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-400 mb-1">Due Date</label>
            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</span>
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-400 mb-1">Created</label>
            <span>{formatDateTime(task.createdAt)}</span>
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-400 mb-1">Last Updated</label>
            <span>{formatDateTime(task.updatedAt)}</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={toggleComplete}
            className={`px-4 py-2 rounded-md transition ${
              task.status === "done"
                ? "bg-gray-300 text-gray-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            disabled={task.status === "done"}
          >
            {task.status === "done" ? "Completed" : "Mark as Completed"}
          </button>
          <button
            onClick={openEdit}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Edit Task
          </button>
          <button
            onClick={() => router.push(`/projects/${task.projectId}/tasks`)}
            className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
          >
            Back to Tasks
          </button>
        </div>

        {/* Comments placeholder */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Comments</h2>
          <div className="bg-gray-50 border rounded p-4 text-gray-500">
            Discussion feature coming soon!
          </div>
        </div>

        {/* Edit Modal */}
        {editOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full border rounded px-2 py-1"
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full border rounded px-2 py-1"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assign Users</label>
                  <div className="border rounded px-2 py-2 space-y-2 max-h-40 overflow-y-auto">
                    {allUsers.length === 0 && (
                      <span className="text-gray-500 text-sm">No users available.</span>
                    )}
                    {allUsers.map((u: any) => {
                      const checked = editForm.assignedUserIds.includes(u.id);
                      return (
                        <label
                          key={u.id}
                          className="flex items-center gap-2 cursor-pointer py-1"
                        >
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={checked}
                            onChange={() => {
                              setEditForm((prev: any) => {
                                const ids = prev.assignedUserIds.includes(u.id)
                                  ? prev.assignedUserIds.filter((id: any) => id !== u.id)
                                  : [...prev.assignedUserIds, u.id];
                                return { ...prev, assignedUserIds: ids };
                              });
                            }}
                          />
                          <span>
                            <span className="font-medium">{u.name}</span>{" "}
                            <span className="text-xs text-gray-500">&lt;{u.email}&gt;</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setEditOpen(false)}
                    disabled={editSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    disabled={editSaving}
                  >
                    {editSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <Toaster position="bottom-right" />
      </div>
    </Layout>
  );
}