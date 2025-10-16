import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userId = Number((session.user as any).id);

  if (req.method === 'POST') {
    const { taskId, text } = req.body as { taskId: number; text: string };
    if (!taskId || !text) return res.status(400).json({ error: 'Missing fields' });

    const comment = await prisma.comment.create({
      data: { taskId: Number(taskId), userId, text },
      include: { user: true, task: { include: { project: true } } },
    });

    const supervisorId = comment.task.project.supervisorId;
    if (supervisorId !== userId) {
      await prisma.notification.create({
        data: {
          projectId: comment.task.projectId,
          taskId: comment.taskId,
          actorId: userId,
          recipientId: supervisorId,
          type: 'task_commented',
          message: `New comment on task "${comment.task.title}"`,
        },
      });
    }

    return res.status(201).json(comment);
  }

  res.setHeader('Allow', 'POST');
  res.status(405).end('Method Not Allowed');
}