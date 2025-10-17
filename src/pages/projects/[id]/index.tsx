import { useRouter } from "next/router";
import useSWR from "swr";
import Layout from "@/components/Layout";
import { ProjectLayout } from "@/components/ProjectLayout";
import { toast, Toaster } from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProjectOverview() {
  const router = useRouter();
  const { id } = router.query;

  const { data: project, error } = useSWR(
    id ? `/api/projects/${id}` : null,
    fetcher
  );

  if (error) return <Layout title="Project">Failed to load project.</Layout>;
  if (!project) return <Layout title="Project">Loading...</Layout>;

  // Compute timeline progress
  const progress =
    project.startDate && project.endDate
      ? Math.min(
          100,
          Math.max(
            0,
            ((new Date().getTime() - new Date(project.startDate).getTime()) /
              (new Date(project.endDate).getTime() -
                new Date(project.startDate).getTime())) *
              100
          )
        )
      : 0;

  // Compute status (example logic)
  const status = (() => {
    const overdueTasks = project.tasks?.filter(
      (t: any) => new Date(t.dueDate) < new Date() && t.status !== "done"
    ).length;
    if (!overdueTasks) return "On Track";
    if (overdueTasks === 1) return "At Risk";
    if (overdueTasks > 1 && overdueTasks < 3) return "Danger";
    return "Failing";
  })();

  return (
    <Layout title={`Project: ${project.title}`}>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md shadow-sm transition"
        >
          ← Back to Dashboard
        </button>
        <ProjectLayout
          projectId={id as string}
          title={project.title}
          category={project.category}
        >
          <section className="space-y-6">
            {/* Status */}
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  status === "On Track"
                    ? "bg-green-100 text-green-800"
                    : status === "At Risk"
                    ? "bg-yellow-100 text-yellow-800"
                    : status === "Danger"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {status}
              </span>
              <span className="text-gray-600 text-sm">Project Status</span>
            </div>

            {/* Progress timeline */}
            {project.startDate && project.endDate && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>
                    {new Date(project.startDate).toLocaleDateString()}
                  </span>
                  <span>{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-3 bg-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                  <div
                    className="absolute top-0 h-3 w-1 bg-black"
                    style={{
                      left: `${progress}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Description</h3>
              <p className="text-gray-600">
                {project.description || "No description provided."}
              </p>
            </div>

            {/* People */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Team</h3>
              <ul className="text-gray-700 space-y-1">
                <li>
                  <strong>Supervisor:</strong> {project.supervisor?.name}{" "}
                  <a
                    href={`mailto:${project.supervisor?.email}`}
                    className="text-blue-500"
                  >
                    ✉️
                  </a>
                </li>
                {project.students?.length > 0 && (
                  <li>
                    <strong>Student(s):</strong>{" "}
                    {project.students.map((s: any) => (
                      <span key={s.id}>
                        {s.name}{" "}
                        <a href={`mailto:${s.email}`} className="text-blue-500">
                          ✉️
                        </a>{" "}
                      </span>
                    ))}
                  </li>
                )}
                {project.collaborators?.length > 0 && (
                  <li>
                    <strong>Collaborator(s):</strong>{" "}
                    {project.collaborators.map((c: any) => (
                      <span key={c.id}>
                        {c.name}{" "}
                        <a href={`mailto:${c.email}`} className="text-blue-500">
                          ✉️
                        </a>{" "}
                      </span>
                    ))}
                  </li>
                )}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => router.push(`/projects/${id}/edit`)}
              >
                Edit Project
              </button>
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `/api/projects/${id}/request-update`,
                      { method: "POST" }
                    );
                    if (!res.ok) throw new Error("Failed to send request");
                    toast.success("Update request sent!");
                  } catch (err) {
                    console.error(err);
                    toast.error("Error sending update request");
                  }
                }}
              >
                Request Update
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={async () => {
                  if (!confirm("Mark this project as completed?")) return;
                  try {
                    const res = await fetch(`/api/projects/${id}/complete`, {
                      method: "PUT",
                    });
                    const data = await res.json();
                    if (!res.ok)
                      throw new Error(
                        data.error || "Failed to complete project"
                      );
                    toast.success("Project marked as completed!");
                    router.push("/dashboard");
                  } catch (err) {
                    console.error(err);
                    toast.error("Could not mark project as completed");
                  }
                }}
              >
                Mark as Completed
              </button>
            </div>
          </section>
        </ProjectLayout>
      </div>
      <Toaster position="bottom-right" />
    </Layout>
  );
}
