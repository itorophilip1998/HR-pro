import { PrismaClient, ProjectStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const teamMembers = [
  'Alice Johnson',
  'Bob Smith',
  'Charlie Brown',
  'Diana Prince',
  'Eve Williams',
  'Frank Miller',
  'Grace Lee',
  'Henry Davis',
];

const projectNames = [
  'Website Redesign',
  'Mobile App Development',
  'API Integration',
  'Database Migration',
  'Cloud Infrastructure',
  'Security Audit',
  'Performance Optimization',
  'Feature Enhancement',
  'Bug Fix Sprint',
  'UI/UX Overhaul',
  'Payment System',
  'Analytics Dashboard',
  'Email Campaign',
  'Content Management',
  'E-commerce Platform',
  'Customer Portal',
  'Admin Dashboard',
  'Reporting System',
  'Notification Service',
  'Authentication System',
  'Data Export Tool',
  'Search Functionality',
  'Recommendation Engine',
  'Social Media Integration',
  'Video Streaming',
  'Documentation Portal',
  'Testing Framework',
  'CI/CD Pipeline',
  'Monitoring System',
  'Backup Solution',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function getRandomStatus(): ProjectStatus {
  const statuses = [
    ProjectStatus.ACTIVE,
    ProjectStatus.ON_HOLD,
    ProjectStatus.COMPLETED,
  ];
  return getRandomElement(statuses);
}

async function main() {
  console.log('Starting seed...');

  // Create default admin user if it doesn't exist
  const adminEmail = 'admin@hr-pro.com';
  const adminPassword = 'admin123';
  const adminName = 'Admin User';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    try {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const createdUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
        },
      });
      console.log(`✅ Created admin user: ${adminEmail} (ID: ${createdUser.id})`);
    } catch (error) {
      console.error(`❌ Error creating admin user:`, error);
      throw error;
    }
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  // Clear existing projects
  await prisma.project.deleteMany();
  console.log('Cleared existing projects');

  // Generate projects
  const now = new Date();
  const futureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
  const pastDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000); // 6 months ago

  for (let i = 0; i < 25; i++) {
    const status = getRandomStatus();
    let deadline: Date;

    // Set deadlines based on status
    if (status === ProjectStatus.COMPLETED) {
      deadline = getRandomDate(pastDate, now);
    } else if (status === ProjectStatus.ON_HOLD) {
      deadline = getRandomDate(now, futureDate);
    } else {
      deadline = getRandomDate(now, futureDate);
    }

    const budget = Math.floor(Math.random() * 100000) + 5000; // $5,000 to $105,000

    await prisma.project.create({
      data: {
        name: getRandomElement(projectNames),
        status,
        deadline,
        assignedTeamMember: getRandomElement(teamMembers),
        budget,
      },
    });
  }

  console.log(`Created 25 projects`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
