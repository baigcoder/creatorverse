import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@skillmango.ai' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@skillmango.ai',
      passwordHash: await argon2.hash('Admin123!'),
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  // Create demo creator
  const creatorUser = await prisma.user.upsert({
    where: { email: 'creator@skillmango.ai' },
    update: {},
    create: {
      name: 'Sarah Chen',
      email: 'creator@skillmango.ai',
      passwordHash: await argon2.hash('Creator123!'),
      role: 'CREATOR',
      status: 'ACTIVE',
      emailVerified: true,
      avatarUrl: null,
    },
  });

  const creator = await prisma.creatorProfile.upsert({
    where: { userId: creatorUser.id },
    update: {},
    create: {
      userId: creatorUser.id,
      brandName: 'Sarah Chen Design',
      bio: 'UX Designer and educator helping creators build better products.',
      slug: 'sarah-chen-design',
      socialLinks: { twitter: '@sarahchen', linkedin: 'sarahchen' },
      verifiedAt: new Date(),
    },
  });

  // Create demo learner
  const learnerUser = await prisma.user.upsert({
    where: { email: 'learner@skillmango.ai' },
    update: {},
    create: {
      name: 'Alex Rivera',
      email: 'learner@skillmango.ai',
      passwordHash: await argon2.hash('Learner123!'),
      role: 'LEARNER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  console.log(`✅ Created users: admin=${adminUser.id}, creator=${creatorUser.id}, learner=${learnerUser.id}`);

  // Create demo courses
  const course1 = await prisma.course.upsert({
    where: { slug: 'ux-design-masterclass' },
    update: {
      creatorId: creator.id,
      title: 'UX Design Masterclass',
      description: 'Learn modern UX design from research to high-fidelity prototypes. Master Figma, design systems, and user testing.',
      price: 49.99,
      currency: 'USD',
      status: 'PUBLISHED',
      level: 'INTERMEDIATE',
      language: 'en',
      totalDuration: 7200,
      publishedAt: new Date(),
    },
    create: {
      creatorId: creator.id,
      title: 'UX Design Masterclass',
      slug: 'ux-design-masterclass',
      description: 'Learn modern UX design from research to high-fidelity prototypes. Master Figma, design systems, and user testing.',
      price: 49.99,
      currency: 'USD',
      status: 'PUBLISHED',
      level: 'INTERMEDIATE',
      language: 'en',
      totalDuration: 7200,
      publishedAt: new Date(),
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: 'ai-for-professionals' },
    update: {
      creatorId: creator.id,
      title: 'AI for Professionals',
      description: 'Master AI tools and workflows for your professional career. From prompt engineering to AI-powered design.',
      price: 79.99,
      currency: 'USD',
      status: 'PUBLISHED',
      level: 'ADVANCED',
      language: 'en',
      totalDuration: 5400,
      publishedAt: new Date(),
    },
    create: {
      creatorId: creator.id,
      title: 'AI for Professionals',
      slug: 'ai-for-professionals',
      description: 'Master AI tools and workflows for your professional career. From prompt engineering to AI-powered design.',
      price: 79.99,
      currency: 'USD',
      status: 'PUBLISHED',
      level: 'ADVANCED',
      language: 'en',
      totalDuration: 5400,
      publishedAt: new Date(),
    },
  });

  const course3 = await prisma.course.upsert({
    where: { slug: 'fitness-fundamentals' },
    update: {
      creatorId: creator.id,
      title: 'Fitness Fundamentals',
      description: 'Build a solid fitness foundation with science-backed methods.',
      price: 29.99,
      currency: 'USD',
      status: 'PUBLISHED',
      level: 'BEGINNER',
      language: 'en',
      totalDuration: 3600,
      publishedAt: new Date(),
    },
    create: {
      creatorId: creator.id,
      title: 'Fitness Fundamentals',
      slug: 'fitness-fundamentals',
      description: 'Build a solid fitness foundation with science-backed methods.',
      price: 29.99,
      currency: 'USD',
      status: 'PUBLISHED',
      level: 'BEGINNER',
      language: 'en',
      totalDuration: 3600,
      publishedAt: new Date(),
    },
  });

  console.log(`✅ Created courses: ${course1.id}, ${course2.id}, ${course3.id}`);

  // Create course sections and lessons
  let section1 = await prisma.courseSection.findFirst({
    where: { courseId: course1.id, title: 'Getting Started' },
  });

  section1 ??= await prisma.courseSection.create({
    data: {
      courseId: course1.id,
      title: 'Getting Started',
      order: 0,
    },
  });

  let section2 = await prisma.courseSection.findFirst({
    where: { courseId: course1.id, title: 'Core Concepts' },
  });

  section2 ??= await prisma.courseSection.create({
    data: {
      courseId: course1.id,
      title: 'Core Concepts',
      order: 1,
    },
  });

  const lessons = [
    { sectionId: section1.id, courseId: course1.id, title: 'Welcome to the Course', type: 'VIDEO' as const, order: 0, isPreview: true, duration: 300 },
    { sectionId: section1.id, courseId: course1.id, title: 'Course Overview', type: 'TEXT' as const, order: 1, duration: 120 },
    { sectionId: section1.id, courseId: course1.id, title: 'Setting Up Your Environment', type: 'VIDEO' as const, order: 2, duration: 600 },
    { sectionId: section2.id, courseId: course1.id, title: 'Understanding Design Thinking', type: 'VIDEO' as const, order: 0, duration: 900 },
    { sectionId: section2.id, courseId: course1.id, title: 'User Research Methods', type: 'VIDEO' as const, order: 1, duration: 1200 },
    { sectionId: section2.id, courseId: course1.id, title: 'Initial Quiz', type: 'QUIZ' as const, order: 2, duration: 0 },
  ];

  for (const lesson of lessons) {
    const existingLesson = await prisma.lesson.findFirst({
      where: { sectionId: lesson.sectionId, title: lesson.title },
    });

    if (existingLesson) {
      await prisma.lesson.update({ where: { id: existingLesson.id }, data: lesson });
    } else {
      await prisma.lesson.create({ data: lesson });
    }
  }

  console.log('✅ Created sections and lessons');

  // Create community
  const community = await prisma.community.upsert({
    where: { slug: 'design-community' },
    update: {
      creatorId: creator.id,
      name: 'Design Community',
      description: 'A community for designers and creators to share, learn, and grow together.',
      visibility: 'PUBLIC',
    },
    create: {
      creatorId: creator.id,
      name: 'Design Community',
      slug: 'design-community',
      description: 'A community for designers and creators to share, learn, and grow together.',
      visibility: 'PUBLIC',
    },
  });

  const rooms = [
    { communityId: community.id, name: 'General', type: 'TEXT' as const, order: 0 },
    { communityId: community.id, name: 'Q&A', type: 'TEXT' as const, order: 1 },
    { communityId: community.id, name: 'Show & Tell', type: 'TEXT' as const, order: 2 },
    { communityId: community.id, name: 'Announcements', type: 'ANNOUNCEMENT' as const, order: 3 },
  ];

  for (const room of rooms) {
    const existingRoom = await prisma.communityRoom.findFirst({
      where: { communityId: community.id, name: room.name },
    });

    if (existingRoom) {
      await prisma.communityRoom.update({ where: { id: existingRoom.id }, data: room });
    } else {
      await prisma.communityRoom.create({ data: room });
    }
  }

  console.log('✅ Created community');

  // Create badges
  const badges = [
    { name: 'First Course', description: 'Complete your first course', type: 'COURSE_COMPLETION' as const, iconUrl: '🎓', criteria: { coursesCompleted: 1 } },
    { name: 'Quick Learner', description: 'Complete 3 lessons in one day', type: 'STREAK' as const, iconUrl: '⚡', criteria: { lessonsInDay: 3 } },
    { name: 'Community Helper', description: 'Answer 5 questions in the community', type: 'COMMUNITY' as const, iconUrl: '🤝', criteria: { answersGiven: 5 } },
    { name: 'Workshop Pro', description: 'Attend 3 live workshops', type: 'WORKSHOP' as const, iconUrl: '🎭', criteria: { workshopsAttended: 3 } },
    { name: 'Consistency', description: 'Maintain a 7-day streak', type: 'STREAK' as const, iconUrl: '🔥', criteria: { streakDays: 7 } },
  ];

  for (const badge of badges) {
    const existingBadge = await prisma.badge.findFirst({ where: { name: badge.name } });

    if (existingBadge) {
      await prisma.badge.update({ where: { id: existingBadge.id }, data: badge });
    } else {
      await prisma.badge.create({ data: badge });
    }
  }

  console.log('✅ Created badges');

  // Create membership plan
  const membershipPlan = await prisma.membershipPlan.findFirst({
    where: { creatorId: creator.id, name: 'Pro Membership' },
  });

  const membershipPlanData = {
    creatorId: creator.id,
    name: 'Pro Membership',
    description: 'Get access to all courses, community, and monthly workshops.',
    price: 19.99,
    currency: 'USD',
    interval: 'MONTHLY' as const,
    benefits: ['All courses included', 'Community access', 'Monthly workshops', 'Certificate of completion'],
    communityAccess: true,
    courseIds: [course1.id, course2.id, course3.id],
    status: 'PUBLISHED' as const,
  };

  if (membershipPlan) {
    await prisma.membershipPlan.update({
      where: { id: membershipPlan.id },
      data: membershipPlanData,
    });
  } else {
    await prisma.membershipPlan.create({
      data: membershipPlanData,
    });
  }

  console.log('✅ Created membership plan');

  // Create certificate template
  const certificateTemplate = await prisma.certificateTemplate.findFirst({
    where: { creatorId: creator.id, name: 'Default Template' },
  });

  const certificateTemplateData = {
    creatorId: creator.id,
    name: 'Default Template',
    design: {
      backgroundColor: '#FFFFFF',
      textColor: '#0B1020',
      accentColor: '#FF9F1C',
      fontFamily: 'Inter',
      showLogo: true,
      showDate: true,
    },
  };

  if (certificateTemplate) {
    await prisma.certificateTemplate.update({
      where: { id: certificateTemplate.id },
      data: certificateTemplateData,
    });
  } else {
    await prisma.certificateTemplate.create({
      data: certificateTemplateData,
    });
  }

  console.log('✅ Created certificate template');

  console.log('\n🎉 Seed complete!\n');
  console.log('Demo accounts:');
  console.log('  Admin:    admin@skillmango.ai / Admin123!');
  console.log('  Creator:  creator@skillmango.ai / Creator123!');
  console.log('  Learner:  learner@skillmango.ai / Learner123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
