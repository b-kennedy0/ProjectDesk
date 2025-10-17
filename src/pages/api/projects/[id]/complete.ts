import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    const projectId = Number(id);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: true },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if any tasks are still incomplete
    const incompleteTasks = project.tasks.filter((t) => t.status !== "done");
    if (incompleteTasks.length > 0) {
      return res.status(400).json({ error: "Cannot complete project with unfinished tasks" });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { isCompleted: true },
    });

    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to complete project" });
  }
}