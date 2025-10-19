import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

// Helper to get task by ID
async function getTaskById(taskId: string) {
  return prisma.task.findUnique({
    where: { id: Number(taskId) },
    include: {
      project: {
        include: {
          students: true,
          collaborators: true,
          supervisor: true,
        },
      },
      assignee: true,
      assignedUsers: true,
    },
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
    body,
  } = req;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (method === "GET") {
    // Fetch a task by ID
    const task = await getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    return res.status(200).json({ task });
  }

  if (method === "PUT") {
    // Toggle completion status
    const task = await prisma.task.findUnique({ where: { id: Number(id) } });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    const newStatus = task.status === "done" ? "pending" : "done";
    const updated = await prisma.task.update({
      where: { id: Number(id) },
      data: { status: newStatus },
      include: { assignedUsers: true },
    });
    return res.status(200).json({ task: updated });
  }

  if (method === "POST") {
    // Toggle flag/unflag or update assigned users
    const { unflag, assignedUserIds } = body;
    const task = await prisma.task.findUnique({ where: { id: Number(id) } });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    if (unflag) {
      // Unflag: set flagged=false, delete notification
      const updated = await prisma.task.update({
        where: { id: Number(id) },
        data: { flagged: false },
        include: { assignedUsers: true },
      });
      await prisma.notification.deleteMany({
        where: {
          taskId: Number(id),
          type: "flag",
        },
      });
      return res.status(200).json({ task: updated, message: "Task unflagged" });
    } else if (assignedUserIds) {
      // Update assigned users
      const updated = await prisma.task.update({
        where: { id: Number(id) },
        data: {
          assignedUsers: {
            set: [],
            connect: assignedUserIds.map((userId: string) => ({ id: userId })),
          },
        },
        include: { assignedUsers: true },
      });
      return res.status(200).json({ task: updated, message: "Assigned users updated" });
    } else {
      // Flag: set flagged=true, create notification
      const updated = await prisma.task.update({
        where: { id: Number(id) },
        data: { flagged: true },
        include: { assignedUsers: true },
      });
      // Actor's name
      const actorName = session.user?.name || session.user?.email || "Someone";
      // Find assigned user to notify
      const assignedToId = task.assignedToId;
      if (assignedToId) {
        await prisma.notification.create({
          data: {
            type: "flag",
            message: `Task "${task.title}" was flagged by ${actorName}`,
            userId: assignedToId,
            taskId: Number(id),
          },
        });
      }
      return res.status(200).json({ task: updated, message: "Task flagged" });
    }
  }

  return res.setHeader("Allow", ["GET", "PUT", "POST"]).status(405).end(`Method ${method} Not Allowed`);
}