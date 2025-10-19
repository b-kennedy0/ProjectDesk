import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: taskId } = req.query;

  if (typeof taskId !== "string") {
    res.status(400).json({ error: "Invalid task ID" });
    return;
  }

  if (req.method === "GET") {
    try {
      const comments = await prisma.comment.findMany({
        where: { taskId: Number(taskId) },
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  } else if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { content } = req.body;
    if (typeof content !== "string" || content.trim() === "") {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          user: { connect: { id: session.user.id } },
          task: { connect: { id: Number(taskId) } },
        },
      });
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  } else if (req.method === "PATCH") {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id, content } = req.body;
    if (!id || typeof content !== "string" || content.trim() === "") {
      res.status(400).json({ error: "Invalid data" });
      return;
    }

    try {
      const comment = await prisma.comment.findUnique({
        where: { id: Number(id) },
        select: { userId: true },
      });
      if (!comment) {
        res.status(404).json({ error: "Comment not found" });
        return;
      }
      if (comment.userId !== session.user.id) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const updated = await prisma.comment.update({
        where: { id: Number(id) },
        data: { content },
      });
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update comment" });
    }
  } else if (req.method === "DELETE") {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.body;
    if (!id) {
      res.status(400).json({ error: "Comment ID required" });
      return;
    }

    try {
      const comment = await prisma.comment.findUnique({
        where: { id: Number(id) },
        select: { userId: true },
      });
      if (!comment) {
        res.status(404).json({ error: "Comment not found" });
        return;
      }
      if (comment.userId !== session.user.id) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      await prisma.comment.delete({ where: { id: Number(id) } });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
