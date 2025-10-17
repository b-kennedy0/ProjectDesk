import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { title, description, startDate, endDate, category } = req.body;

      const project = await prisma.project.create({
        data: {
          title,
          description,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          category: category || "student-project",
          supervisorId: 1,
        },
      });

      return res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { category, isCompleted } = req.query;

    const where: any = {};

    if (category) where.category = String(category);
    if (isCompleted !== undefined) {
      where.isCompleted = isCompleted === "true";
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        students: true,
        collaborators: true,
        supervisor: true,
      },
      orderBy: [{ endDate: "asc" }, { title: "asc" }],
    });

    return res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}