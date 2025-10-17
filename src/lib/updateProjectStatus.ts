import { prisma } from "@/lib/prisma";

export async function updateProjectStatus(projectId: number) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { tasks: true },
  });

  if (!project) return;

  const now = new Date();
  const overdueTasks = project.tasks.filter(
    t => t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
  );
  const tasksBeyondProject = project.tasks.filter(
    t => t.dueDate && project.endDate && new Date(t.dueDate) > new Date(project.endDate)
  );

  let newStatus = "On Track";

  if (project.tasks.every(t => t.status === "done")) {
    newStatus = "Completed";
  } else if (tasksBeyondProject.length > 0) {
    newStatus = "Danger";
  } else if (overdueTasks.length > 1) {
    newStatus = "Behind Schedule";
  } else if (overdueTasks.length === 1) {
    newStatus = "At Risk";
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { status: newStatus },
  });

  return newStatus;
}