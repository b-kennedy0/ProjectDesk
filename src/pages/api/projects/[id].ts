import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const { title, description, startDate, endDate, category } = req.body;

      const updatedProject = await prisma.project.update({
        where: { id: Number(id) },
        data: {
          title,
          description,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          category,
        },
      });

      return res.status(200).json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      return res.status(500).json({ error: "Failed to update project" });
    }
  }

  if (req.method === "GET") {
    try {
      const project = await prisma.project.findUnique({
        where: { id: Number(id) },
        include: { students: true, collaborators: true, supervisor: true },
      });

      if (!project) return res.status(404).json({ error: "Project not found" });

      return res.status(200).json(project);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error fetching project" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}