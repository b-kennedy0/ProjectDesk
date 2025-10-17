// Simple seed to create a demo supervisor user for local credentials login
// User: demo@projectdesk.local  Password: password123

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const supervisor = await prisma.user.upsert({
    where: { email: 'demo@projectdesk.local' },
    update: {},
    create: {
      email: 'demo@projectdesk.local',
      name: 'Demo Supervisor',
      role: 'SUPERVISOR',
      passwordHash,
    },
  });

  console.log('Seeded user:', supervisor.email);

  // Create additional users
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@projectdesk.local' },
    update: {},
    create: {
      email: 'student1@projectdesk.local',
      name: 'Student One',
      role: 'STUDENT',
      passwordHash: await bcrypt.hash('studentpass1', 10),
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@projectdesk.local' },
    update: {},
    create: {
      email: 'student2@projectdesk.local',
      name: 'Student Two',
      role: 'STUDENT',
      passwordHash: await bcrypt.hash('studentpass2', 10),
    },
  });

  const collaborator1 = await prisma.user.upsert({
    where: { email: 'collaborator1@projectdesk.local' },
    update: {},
    create: {
      email: 'collaborator1@projectdesk.local',
      name: 'Collaborator One',
      role: 'COLLABORATOR',
      passwordHash: await bcrypt.hash('collabpass1', 10),
    },
  });

  const collaborator2 = await prisma.user.upsert({
    where: { email: 'collaborator2@projectdesk.local' },
    update: {},
    create: {
      email: 'collaborator2@projectdesk.local',
      name: 'Collaborator Two',
      role: 'COLLABORATOR',
      passwordHash: await bcrypt.hash('collabpass2', 10),
    },
  });

  // Create projects linked to the supervisor

  // Project 1: Active student project
  const project1 = await prisma.project.create({
    data: {
      title: "Student Project Alpha",
      description: "Research project on AI applications.",
      startDate: new Date("2025-01-15T00:00:00.000Z"),
      endDate: new Date("2025-06-15T00:00:00.000Z"),
      category: "student-project",
      supervisorId: supervisor.id,
      students: {
        connect: [{ email: 'student1@projectdesk.local' }],
      },
    },
  });

  // Project 2: Active collaboration project
  const project2 = await prisma.project.create({
    data: {
      title: "Collaboration Project Beta",
      description: "Joint study on cognitive load and performance.",
      startDate: new Date("2025-02-01T00:00:00.000Z"),
      endDate: new Date("2025-12-31T00:00:00.000Z"),
      category: "collaboration",
      supervisorId: supervisor.id,
      collaborators: {
        connect: [
          { email: 'collaborator1@projectdesk.local' },
          { email: 'collaborator2@projectdesk.local' }
        ],
      },
      students: {
        connect: [{ email: 'student2@projectdesk.local' }],
      },
    },
  });

  // Project 3: Completed student project
  const project3 = await prisma.project.create({
    data: {
      title: "Student Project Gamma",
      description: "EEG analysis of visual processing under stress.",
      startDate: new Date("2024-07-01T00:00:00.000Z"),
      endDate: new Date("2025-03-31T00:00:00.000Z"),
      category: "student-project",
      supervisorId: supervisor.id,
      students: {
        connect: [{ email: 'student2@projectdesk.local' }],
      },
    },
  });

  // Create tasks for project1
  await prisma.task.createMany({
    data: [
      {
        title: 'Literature Review',
        status: 'done',
        dueDate: new Date('2025-02-15'),
        flagged: false,
        projectId: project1.id,
      },
      {
        title: 'Data Collection',
        status: 'in_progress',
        dueDate: new Date('2025-03-15'),
        flagged: true,
        projectId: project1.id,
      },
      {
        title: 'Data Analysis',
        status: 'todo',
        dueDate: new Date('2025-05-01'),
        flagged: false,
        projectId: project1.id,
      },
    ],
  });

  // Create tasks for project2
  await prisma.task.createMany({
    data: [
      {
        title: 'Initial Survey',
        status: 'done',
        dueDate: new Date('2025-03-01'),
        flagged: false,
        projectId: project2.id,
      },
      {
        title: 'Prototype Development',
        status: 'in_progress',
        dueDate: new Date('2025-06-01'),
        flagged: true,
        projectId: project2.id,
      },
      {
        title: 'User Testing',
        status: 'todo',
        dueDate: new Date('2025-10-01'),
        flagged: false,
        projectId: project2.id,
      },
      {
        title: 'Final Report',
        status: 'todo',
        dueDate: new Date('2025-12-15'),
        flagged: true,
        projectId: project2.id,
      },
    ],
  });

  // Create tasks for project3
  await prisma.task.createMany({
    data: [
      {
        title: 'Stakeholder Meeting',
        status: 'done',
        dueDate: new Date('2024-08-01'),
        flagged: false,
        projectId: project3.id,
      },
      {
        title: 'Resource Allocation',
        status: 'done',
        dueDate: new Date('2024-09-15'),
        flagged: false,
        projectId: project3.id,
      },
      {
        title: 'Data Analysis',
        status: 'done',
        dueDate: new Date('2025-02-15'),
        flagged: true,
        projectId: project3.id,
      },
      {
        title: 'Final Presentation',
        status: 'done',
        dueDate: new Date('2025-03-15'),
        flagged: false,
        projectId: project3.id,
      },
    ],
  });

  console.log('Seed process completed successfully.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});