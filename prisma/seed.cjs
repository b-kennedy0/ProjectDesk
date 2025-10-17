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
      role: 'supervisor',
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
    role: 'student',
    passwordHash: await bcrypt.hash('studentpass1', 10),
  },
});

const student2 = await prisma.user.upsert({
  where: { email: 'student2@projectdesk.local' },
  update: {},
  create: {
    email: 'student2@projectdesk.local',
    name: 'Student Two',
    role: 'student',
    passwordHash: await bcrypt.hash('studentpass2', 10),
  },
});

const collaborator1 = await prisma.user.upsert({
  where: { email: 'collaborator1@projectdesk.local' },
  update: {},
  create: {
    email: 'collaborator1@projectdesk.local',
    name: 'Collaborator One',
    role: 'collaborator',
    passwordHash: await bcrypt.hash('collabpass1', 10),
  },
});

  // Create projects linked to the supervisor
const project1 = await prisma.project.create({
  data: {
    title: "Student Project Alpha",
    description: "Research project on AI applications.",
    startDate: new Date("2024-01-15T00:00:00.000Z"),
    endDate: new Date("2024-06-15T00:00:00.000Z"),
    category: "student-project",
    supervisorId: 1,
    students: {
      connect: [{ email: 'student1@projectdesk.local' }],
    },
  },
});

const project2 = await prisma.project.create({
  data: {
    title: "Collaboration Project Beta",
    description: "Joint study on cognitive load and performance.",
    startDate: new Date("2024-02-01T00:00:00.000Z"),
    endDate: new Date("2024-08-30T00:00:00.000Z"),
    category: "collaboration",
    supervisorId: 1,
    collaborators: {
      connect: [{ email: 'collaborator1@projectdesk.local' }],
    },
  },
});

const project3 = await prisma.project.create({
  data: {
    title: "Student Project Gamma",
    description: "EEG analysis of visual processing under stress.",
    startDate: new Date("2024-03-10T00:00:00.000Z"),
    endDate: new Date("2024-09-10T00:00:00.000Z"),
    category: "student-project",
    supervisorId: 1,
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
        status: 'in_progress',
        dueDate: new Date('2024-02-15'),
        projectId: project1.id,
      },
      {
        title: 'Data Collection',
        status: 'todo',
        dueDate: new Date('2024-03-15'),
        projectId: project1.id,
      },
    ],
  });

  // Create tasks for project2
  await prisma.task.createMany({
    data: [
      {
        title: 'Initial Survey',
        status: 'in_progress',
        dueDate: new Date('2024-03-01'),
        projectId: project2.id,
      },
      {
        title: 'Prototype Development',
        status: 'todo',
        dueDate: new Date('2024-05-01'),
        projectId: project2.id,
      },
    ],
  });

  // Create tasks for project3
  await prisma.task.createMany({
    data: [
      {
        title: 'Stakeholder Meeting',
        status: 'in_progress',
        dueDate: new Date('2024-04-01'),
        projectId: project3.id,
      },
      {
        title: 'Resource Allocation',
        status: 'todo',
        dueDate: new Date('2024-05-15'),
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