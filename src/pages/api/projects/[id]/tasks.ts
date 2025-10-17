import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query;
  const projectId = Number(id);

  try {
    switch (req.method) {
      case "GET": {
        const tasks = await prisma.task.findMany({
          where: { projectId },
          orderBy: { dueDate: "asc" },
        });
        return res.status(200).json({ tasks });
      }

      case "POST": {
        const { title, description, dueDate } = req.body;
        if (!title) return res.status(400).json({ error: "Title is required" });

        const newTask = await prisma.task.create({
          data: {
            title,
            description,
            dueDate: dueDate ? new Date(dueDate) : null,
            projectId,
          },
        });

        return res.status(201).json(newTask);
      }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    console.error("❌ Error fetching/creating tasks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}