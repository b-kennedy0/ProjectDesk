index.ts
```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userId = Number((session.user as any).id);

  if (req.method === 'GET') {
    // Supervisors see their projects; others see projects they belong to
    const role = (session.user as any).role as string;
    const projects = role === 'supervisor'
      ? await prisma.project.findMany({ where: { supervisorId: userId }, orderBy: { createdAt: 'desc' } })
      : await prisma.project.findMany({
          where: { members: { some: { userId } } },
          orderBy: { createdAt: 'desc' },
        });
    return res.json(projects);
  }

  if (req.method === 'POST') {
    const role = (session.user as any).role as string;
    if (role !== 'supervisor') return res.status(403).json({ error: 'Forbidden' });

    const { title, description, startDate, endDate } = req.body as {
      title: string; description?: string; startDate?: string; endDate?: string;
    };

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const project = await prisma.project.create({
      data: {
        title,
        description,
        supervisorId: userId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    return res.status(201).json(project);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end('Method Not Allowed');
}
```
