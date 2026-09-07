import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const tursoUrl = process.env.TURSO_DATABASE_URL
const prisma = new PrismaClient({
  adapter: new PrismaLibSql(
    tursoUrl
      ? { url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN }
      : { url: process.env.DATABASE_URL || 'file:./dev.db' },
  ),
})

async function main() {
  console.log('Seeding…')

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Manikandan K',
      role: 'Software Engineer',
      tagline: 'Building useful things for the web.',
      contactEmail: process.env.CONTACT_TO_EMAIL || '',
    },
  })

  // Sections: upsert by key so re-seeding never clobbers admin edits
  const sectionDefaults: {
    key: string
    title: string
    subtitle?: string
    payload?: Record<string, unknown>
  }[] = [
    {
      key: 'hero',
      title: 'Hero',
      payload: {
        greeting: "Hi, I'm",
        subHeadline: 'I build web products end to end.',
        primaryCta: { label: 'View projects', url: '#projects' },
        secondaryCta: { label: 'Get in touch', url: '#contact' },
      },
    },
    {
      key: 'about',
      title: 'About',
      payload: {
        bio: 'Write a short bio here from the admin panel.',
        portraitPath: '',
        stats: [{ label: 'Years of experience', value: '5+' }],
      },
    },
    { key: 'skills', title: 'Skills', subtitle: 'What I work with' },
    { key: 'experience', title: 'Experience', subtitle: 'Where I have worked' },
    { key: 'projects', title: 'Projects', subtitle: 'Selected work' },
    { key: 'education', title: 'Education' },
    {
      key: 'contact',
      title: 'Contact',
      subtitle: 'Get in touch',
      payload: { blurb: 'Have a question or an opportunity? Send a message below.' },
    },
    { key: 'footer', title: 'Footer', payload: { text: '' } },
  ]

  for (const [i, s] of sectionDefaults.entries()) {
    await prisma.section.upsert({
      where: { key: s.key },
      update: {},
      create: {
        key: s.key,
        title: s.title,
        subtitle: s.subtitle ?? '',
        order: i,
        visible: true,
        payload: JSON.stringify(s.payload ?? {}),
      },
    })
  }

  // Placeholder items — only when the tables are empty
  if ((await prisma.skill.count()) === 0) {
    await prisma.skill.createMany({
      data: [
        { name: 'TypeScript', category: 'Languages', proficiency: 5, order: 0 },
        { name: 'Go', category: 'Languages', proficiency: 4, order: 1 },
        { name: 'Vue / Nuxt', category: 'Frontend', proficiency: 5, order: 2 },
        { name: 'Tailwind CSS', category: 'Frontend', proficiency: 4, order: 3 },
        { name: 'Node.js', category: 'Backend', proficiency: 5, order: 4 },
        { name: 'PostgreSQL', category: 'Backend', proficiency: 4, order: 5 },
      ],
    })
  }

  if ((await prisma.experience.count()) === 0) {
    await prisma.experience.createMany({
      data: [
        {
          company: 'Razorpay',
          role: 'Software Engineer',
          location: 'India',
          startDate: '2023-01',
          bullets: JSON.stringify(['Describe your impact here from the admin panel.']),
          tech: JSON.stringify(['Go', 'Vue']),
          order: 0,
        },
      ],
    })
  }

  if ((await prisma.project.count()) === 0) {
    await prisma.project.createMany({
      data: [
        {
          title: 'Portfolio CMS',
          slug: 'portfolio-cms',
          summary: 'This very site — a Nuxt 3 portfolio with a full admin CMS.',
          description:
            'A personal portfolio where every section is managed from a protected admin panel, with GitHub sign-in, likes, comments, analytics and a contact form.',
          tech: JSON.stringify(['Nuxt 3', 'Tailwind CSS', 'Prisma', 'SQLite']),
          featured: true,
          order: 0,
        },
        {
          title: 'Example Project',
          slug: 'example-project',
          summary: 'A placeholder project — replace it from the admin panel.',
          tech: JSON.stringify(['TypeScript']),
          order: 1,
        },
      ],
    })
  }

  if ((await prisma.education.count()) === 0) {
    await prisma.education.createMany({
      data: [
        {
          institution: 'Your University',
          degree: 'B.E. Computer Science',
          startDate: '2018',
          endDate: '2022',
          order: 0,
        },
      ],
    })
  }

  if ((await prisma.socialLink.count()) === 0) {
    await prisma.socialLink.createMany({
      data: [
        { label: 'GitHub', url: 'https://github.com/', icon: 'github', order: 0 },
        { label: 'LinkedIn', url: 'https://linkedin.com/', icon: 'linkedin', order: 1 },
        { label: 'X', url: 'https://x.com/', icon: 'x', order: 2 },
        { label: 'Email', url: 'mailto:hello@example.com', icon: 'mail', order: 3 },
      ],
    })
  }

  console.log('Seed complete.')
  console.log(
    `Admin GitHub username (ADMIN_GITHUB_USERNAME): ${process.env.ADMIN_GITHUB_USERNAME || '(not set — configure in .env before M3)'}`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
