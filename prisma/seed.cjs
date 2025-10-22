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
      emailVerified: new Date(),
    },
  });

  console.log(`Seeded supervisor: ${supervisor.email} (ID: ${supervisor.id})`);

  // Create additional users
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@projectdesk.local' },
    update: {},
    create: {
      email: 'student1@projectdesk.local',
      name: 'Student One',
      role: 'STUDENT',
      passwordHash: await bcrypt.hash('studentpass1', 10),
      emailVerified: new Date(),
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
      emailVerified: new Date(),
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
      emailVerified: new Date(),
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
      emailVerified: new Date(),
    },
  });

  // Upsert projects linked to the supervisor (idempotent and always assign demo supervisor)
  // Project 1: Active student project
  const project1 = await prisma.project.upsert({
    where: { title: "Student Project Alpha" },
    update: {
      description: "Research project on AI applications.",
      startDate: new Date("2025-01-15T00:00:00.000Z"),
      endDate: new Date("2025-06-15T00:00:00.000Z"),
      category: "student-project",
      supervisorId: supervisor.id,
      students: {
        set: [{ email: 'student1@projectdesk.local' }],
      },
    },
    create: {
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
  const project2 = await prisma.project.upsert({
    where: { title: "Collaboration Project Beta" },
    update: {
      description: "Joint study on cognitive load and performance.",
      startDate: new Date("2025-02-01T00:00:00.000Z"),
      endDate: new Date("2025-12-31T00:00:00.000Z"),
      category: "collaboration",
      supervisorId: supervisor.id,
      collaborators: {
        set: [
          { email: 'collaborator1@projectdesk.local' },
          { email: 'collaborator2@projectdesk.local' }
        ],
      },
      students: {
        set: [{ email: 'student2@projectdesk.local' }],
      },
    },
    create: {
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
  const project3 = await prisma.project.upsert({
    where: { title: "Student Project Gamma" },
    update: {
      description: "EEG analysis of visual processing under stress.",
      startDate: new Date("2024-07-01T00:00:00.000Z"),
      endDate: new Date("2025-03-31T00:00:00.000Z"),
      category: "student-project",
      supervisorId: supervisor.id,
      students: {
        set: [{ email: 'student2@projectdesk.local' }],
      },
    },
    create: {
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

  // Upsert tasks for project1
  const tasksProject1 = [
    {
      title: 'Literature Review',
      status: 'COMPLETE',
      dueDate: new Date('2025-02-15'),
      flagged: false,
      projectId: project1.id,
      startDate: new Date('2025-01-15'),
      duration: 30 * 24 * 60 * 60, // 30 days in seconds
    },
    {
      title: 'Data Collection',
      status: 'IN_PROGRESS',
      dueDate: new Date('2025-03-15'),
      flagged: true,
      projectId: project1.id,
      startDate: new Date('2025-02-16'),
      duration: 27 * 24 * 60 * 60, // 27 days
    },
    {
      title: 'Data Analysis',
      status: 'TODO',
      dueDate: new Date('2025-05-01'),
      flagged: false,
      projectId: project1.id,
      startDate: new Date('2025-03-16'),
      duration: 45 * 24 * 60 * 60, // 45 days
    },
  ];

  // Upsert tasks for project2
  const tasksProject2 = [
    {
      title: 'Initial Survey',
      status: 'COMPLETE',
      dueDate: new Date('2025-03-01'),
      flagged: false,
      projectId: project2.id,
      startDate: new Date('2025-02-01'),
      duration: 28 * 24 * 60 * 60, // 28 days
    },
    {
      title: 'Prototype Development',
      status: 'IN_PROGRESS',
      dueDate: new Date('2025-06-01'),
      flagged: true,
      projectId: project2.id,
      startDate: new Date('2025-03-02'),
      duration: 91 * 24 * 60 * 60, // 91 days
    },
    {
      title: 'User Testing',
      status: 'TODO',
      dueDate: new Date('2025-10-01'),
      flagged: false,
      projectId: project2.id,
      startDate: new Date('2025-06-02'),
      duration: 121 * 24 * 60 * 60, // 121 days
    },
    {
      title: 'Final Report',
      status: 'TODO',
      dueDate: new Date('2025-12-15'),
      flagged: true,
      projectId: project2.id,
      startDate: new Date('2025-11-01'),
      duration: 44 * 24 * 60 * 60, // 44 days
    },
  ];

  // Upsert tasks for project3
  const tasksProject3 = [
    {
      title: 'Stakeholder Meeting',
      status: 'COMPLETE',
      dueDate: new Date('2024-08-01'),
      flagged: false,
      projectId: project3.id,
      startDate: new Date('2024-07-01'),
      duration: 31 * 24 * 60 * 60, // 31 days
    },
    {
      title: 'Resource Allocation',
      status: 'COMPLETE',
      dueDate: new Date('2024-09-15'),
      flagged: false,
      projectId: project3.id,
      startDate: new Date('2024-08-02'),
      duration: 44 * 24 * 60 * 60, // 44 days
    },
    {
      title: 'Data Analysis',
      status: 'COMPLETE',
      dueDate: new Date('2025-02-15'),
      flagged: true,
      projectId: project3.id,
      startDate: new Date('2024-09-16'),
      duration: 152 * 24 * 60 * 60, // 152 days
    },
    {
      title: 'Final Presentation',
      status: 'COMPLETE',
      dueDate: new Date('2025-03-15'),
      flagged: false,
      projectId: project3.id,
      startDate: new Date('2025-02-16'),
      duration: 27 * 24 * 60 * 60, // 27 days
    },
  ];

  // Upsert all tasks and keep references
  const allTasks = [];
  for (const t of tasksProject1.concat(tasksProject2, tasksProject3)) {
    const task = await prisma.task.upsert({
      where: {
        projectId_title: { projectId: t.projectId, title: t.title },
      },
      update: {
        status: t.status,
        dueDate: t.dueDate,
        flagged: t.flagged,
        startDate: t.startDate,
        duration: t.duration,
      },
      create: t,
    });
    allTasks.push(task);
  }

  // Add flaggedBy for some tasks (simulate that students flagged them)
  const flaggedTasks = allTasks.filter(task => task.flagged);
  const flaggers = [student1, student2, collaborator1, collaborator2];
  const flaggedAssignments = [];
  for (const [index, task] of flaggedTasks.entries()) {
    const flagger = flaggers[index % flaggers.length];
    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: { flaggedBy: { connect: { id: flagger.id } } },
    });
    flaggedAssignments.push({ task: updatedTask, actorId: flagger.id });
    const taskIndex = allTasks.findIndex(t => t.id === updatedTask.id);
    if (taskIndex !== -1) {
      allTasks[taskIndex] = updatedTask;
    }
  }

  // Create Task Sets and linked templates to align with schema
  const taskSetDefinitions = [
    {
      name: 'Student Project Basic Set',
      templates: [
        {
          title: 'Standard Literature Review',
          description: 'Conduct a literature review on the relevant topic.',
          duration: 30 * 24 * 60 * 60,
          order: 1,
        },
        {
          title: 'Data Collection Phase',
          description: 'Collect data as per study design.',
          duration: 27 * 24 * 60 * 60,
          order: 2,
        },
        {
          title: 'Analysis & Reporting',
          description: 'Analyze collected data and prepare report.',
          duration: 45 * 24 * 60 * 60,
          order: 3,
        },
      ],
    },
    {
      name: 'Collaboration Project Launch',
      templates: [
        {
          title: 'Stakeholder Meeting',
          description: 'Hold a meeting with project stakeholders.',
          duration: 7 * 24 * 60 * 60,
          order: 1,
        },
        {
          title: 'Data Collection Phase',
          description: 'Collect data as per study design.',
          duration: 27 * 24 * 60 * 60,
          order: 2,
        },
      ],
    },
  ];

  for (const setDef of taskSetDefinitions) {
    let taskSet = await prisma.taskSet.findFirst({
      where: {
        name: setDef.name,
        supervisorId: supervisor.id,
      },
    });

    if (!taskSet) {
      taskSet = await prisma.taskSet.create({
        data: {
          name: setDef.name,
          supervisorId: supervisor.id,
          templates: {
            create: setDef.templates.map((template, index) => ({
              title: template.title,
              description: template.description,
              duration: template.duration,
              order: template.order ?? index + 1,
              dueOffset: template.dueOffset ?? undefined,
            })),
          },
        },
      });
    } else {
      for (const [index, template] of setDef.templates.entries()) {
        const existingTemplate = await prisma.taskTemplate.findFirst({
          where: {
            title: template.title,
            taskSetId: taskSet.id,
          },
        });

        if (existingTemplate) {
          await prisma.taskTemplate.update({
            where: { id: existingTemplate.id },
            data: {
              description: template.description,
              duration: template.duration,
              order: template.order ?? index + 1,
              dueOffset: template.dueOffset ?? undefined,
            },
          });
        } else {
          await prisma.taskTemplate.create({
            data: {
              title: template.title,
              description: template.description,
              duration: template.duration,
              order: template.order ?? index + 1,
              dueOffset: template.dueOffset ?? undefined,
              taskSetId: taskSet.id,
            },
          });
        }
      }
    }
  }

  // Add Comments to existing tasks
  const commentsData = [
    {
      content: "Great job on the literature review!",
      taskId: allTasks.find(t => t.title === 'Literature Review' && t.projectId === project1.id)?.id,
      userId: supervisor.id,
    },
    {
      content: "Please clarify your data sources.",
      taskId: allTasks.find(t => t.title === 'Data Collection' && t.projectId === project1.id)?.id,
      userId: student1.id,
    },
    {
      content: "Prototype is progressing well.",
      taskId: allTasks.find(t => t.title === 'Prototype Development' && t.projectId === project2.id)?.id,
      userId: collaborator1.id,
    },
    {
      content: "User testing plan draft uploaded.",
      taskId: allTasks.find(t => t.title === 'User Testing' && t.projectId === project2.id)?.id,
      userId: student2.id,
    },
  ];
  for (const c of commentsData) {
    if (!c.taskId) continue;
    const exists = await prisma.comment.findFirst({
      where: { content: c.content, taskId: c.taskId, userId: c.userId }
    });
    if (!exists) {
      await prisma.comment.create({ data: c });
    }
  }

  // Add Notifications for flagged tasks and new comments
  const taskById = new Map(allTasks.map(task => [task.id, task]));

  for (const assignment of flaggedAssignments) {
    const task = assignment.task;
    const actorId = assignment.actorId ?? supervisor.id;
    const exists = await prisma.notification.findFirst({
      where: {
        type: 'task_flagged',
        actorId,
        recipientId: supervisor.id,
        taskId: task.id,
      }
    });
    if (!exists) {
      await prisma.notification.create({
        data: {
          type: 'task_flagged',
          actorId,
          recipientId: supervisor.id,
          projectId: task.projectId,
          taskId: task.id,
          message: `Task "${task.title}" has been flagged.`,
        }
      });
    }
  }

  const commentActors = [supervisor, student1, student2, collaborator1, collaborator2];
  for (const c of commentsData) {
    if (!c.taskId) continue;
    const task = taskById.get(c.taskId);
    if (!task) continue;
    for (const recipient of commentActors) {
      if (recipient.id === c.userId) continue;
      const exists = await prisma.notification.findFirst({
        where: {
          type: 'new_comment',
          actorId: c.userId,
          recipientId: recipient.id,
          taskId: c.taskId,
        }
      });
      if (!exists) {
        await prisma.notification.create({
          data: {
            type: 'new_comment',
            actorId: c.userId,
            recipientId: recipient.id,
            projectId: task.projectId,
            taskId: c.taskId,
            message: `New comment on "${task.title}": "${c.content.substring(0, 40)}"`,
          }
        });
      }
    }
  }

  // Log confirmation messages
  const userCount = await prisma.user.count();
  const projectCount = await prisma.project.count();
  const taskCount = await prisma.task.count();
  const templateCount = await prisma.taskTemplate.count();
  const setCount = await prisma.taskSet.count();
  const commentTotal = await prisma.comment.count();
  const notificationTotal = await prisma.notification.count();
  console.log(`Seed process completed successfully.`);
  console.log(`Users: ${userCount}, Projects: ${projectCount}`);
  console.log(`Tasks: ${taskCount}, Task Templates: ${templateCount}, Task Sets: ${setCount}`);
  console.log(`Comments: ${commentTotal}, Notifications: ${notificationTotal}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
