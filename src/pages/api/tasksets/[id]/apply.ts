import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
// Corrected import path to authOptions to properly reference auth API route
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // TaskSet ID from URL query parameters
  const { projectId } = req.body;

  // Validate that id and projectId are present and are numbers to ensure type safety
  if (!id || Array.isArray(id) || isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid or missing TaskSet ID" });
  }
  if (!projectId) {
    return res.status(400).json({ error: "Project ID is required" });
  }

  const numericProjectId = Number(projectId);
  if (isNaN(numericProjectId)) {
    return res.status(400).json({ error: "Invalid Project ID" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  // Check user session and role for authorization
  if (!session || session.user.role !== "SUPERVISOR") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    // Fetch TaskSet including its templates to create tasks accordingly
    const taskSet = await prisma.taskSet.findUnique({
      where: { id: Number(id) },
      include: { templates: true }, // Assumes 'templates' relation exists in schema
    });

    if (!taskSet) {
      return res.status(404).json({ error: "TaskSet not found" });
    }

    if (!taskSet.templates || taskSet.templates.length === 0) {
      return res.status(400).json({ error: "TaskSet has no templates to apply" });
    }

    // Fetch project start date to calculate due dates
    const project = await prisma.project.findUnique({
      where: { id: numericProjectId },
      select: { startDate: true },
    });

    if (!project || !project.startDate) {
      return res.status(400).json({ error: "Project not found or missing start date" });
    }

    // Validate templates fields and create tasks
    const tasks = await Promise.all(
      taskSet.templates.map((template) => {
        if (
          !template.title ||
          typeof template.title !== "string" ||
          typeof template.dueOffset !== "number"
        ) {
          throw new Error("Invalid template data");
        }

        const dueDate = new Date(project.startDate);
        dueDate.setDate(dueDate.getDate() + template.dueOffset);

        return prisma.task.create({
          data: {
            title: template.title,
            description: template.description || null,
            dueDate,
            project: { connect: { id: numericProjectId } }, // Connect task to project by ID
          },
        });
      })
    );

    return res.status(201).json({ message: "Task Set applied successfully", tasks });
  } catch (error) {
    console.error("Error applying task set:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}