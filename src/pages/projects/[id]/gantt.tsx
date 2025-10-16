import { useRouter } from "next/router";
import useSWR from "swr";
import Layout from "@/components/Layout";
import dynamic from "next/dynamic";
import { ViewMode, Task, EventOption } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getTaskColor(t: any) {
  if (t.flagged) return "red";
  if (t.status === "done") return "green";
  if (t.status === "in_progress") return "blue";
  if (t.status === "todo") return "gray";
  return "gray";
}

export default function GanttPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: tasks, mutate } = useSWR(id ? `/api/tasks?projectId=${id}` : null, fetcher);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);

  if (!tasks) return <Layout title="Gantt"><p>Loading…</p></Layout>;

  const ganttTasks: Task[] = tasks.map((t: any) => ({
    id: String(t.id),
    name: t.title,
    start: t.dueDate
      ? new Date(new Date(t.dueDate).getTime() - 7 * 24 * 60 * 60 * 1000)
      : new Date(),
    end: t.dueDate ? new Date(t.dueDate) : new Date(),
    progress: t.status === "done" ? 100 : t.status === "in_progress" ? 50 : 0,
    dependencies: t.dependencyTaskId ? [String(t.dependencyTaskId)] : [],
    type: "task",
    styles: { 
      progressColor: getTaskColor(t), 
      backgroundColor: getTaskColor(t), 
      backgroundSelectedColor: getTaskColor(t) 
    }
  }));

  const GanttComponent = dynamic(() =>
    import("gantt-task-react").then((mod) => mod.Gantt)
  , { ssr: false });

  const handleDateChange = async (task: Task, children: Task[]) => {
    // Update the task dueDate and start date via PATCH
    const newDueDate = task.end.toISOString();
    const newStartDate = task.start.toISOString();
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate: newDueDate, startDate: newStartDate }),
    });
    mutate();
  };

  const handleProgressChange = async (task: Task) => {
    // Convert progress to status and update
    let status = "todo";
    if (task.progress === 100) status = "done";
    else if (task.progress > 0) status = "in_progress";

    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    mutate();
  };


  return (
    <Layout title="Gantt Chart">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Project #{id} Gantt Chart</h1>
        <a href={`/projects/${id}`} className="text-sm border px-3 py-1 rounded-md">
          Back to Project
        </a>
      </div>

      <div className="mb-4 flex space-x-2">
        <button
          className={`px-3 py-1 rounded-md border ${viewMode === ViewMode.Day ? "bg-blue-500 text-white" : ""}`}
          onClick={() => setViewMode(ViewMode.Day)}
        >
          Day
        </button>
        <button
          className={`px-3 py-1 rounded-md border ${viewMode === ViewMode.Week ? "bg-blue-500 text-white" : ""}`}
          onClick={() => setViewMode(ViewMode.Week)}
        >
          Week
        </button>
        <button
          className={`px-3 py-1 rounded-md border ${viewMode === ViewMode.Month ? "bg-blue-500 text-white" : ""}`}
          onClick={() => setViewMode(ViewMode.Month)}
        >
          Month
        </button>
      </div>

      <div className="overflow-auto border rounded-md p-2">
  <GanttComponent
    tasks={ganttTasks}
    viewMode={viewMode}
    onDateChange={handleDateChange}
    onProgressChange={handleProgressChange}
  />
</div>
    </Layout>
  );
}