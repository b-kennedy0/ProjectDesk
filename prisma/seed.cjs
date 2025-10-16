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
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});