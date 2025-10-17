import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

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
          supervisor: {
            connect: { email: session.user.email }, // ✅ Connect logged-in supervisor
          },
        },
      });

      return res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { category, isCompleted } = req.query;
    const where: any = {
      supervisor: { email: session.user.email }, // ✅ Filter by logged-in supervisor
    };

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
        tasks: true,
      },
      orderBy: [{ endDate: "asc" }, { title: "asc" }],
    });

    return res.status(200).json({ projects }); // ✅ Return as object for consistency
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}