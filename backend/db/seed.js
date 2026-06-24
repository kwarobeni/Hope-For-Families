require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const INITIATIVES = [
  {
    title: 'Adolescent Development Initiative',
    slug: 'adolescent-development',
    tagline: 'Empowering teens with life skills for a brighter tomorrow.',
    description:
      'The Adolescent Development Initiative was created to support teenagers and young people through critical stages of personal growth, identity development, emotional wellbeing, and life preparation. The program combines practical training, mentorship, wellbeing support, creativity, and social engagement to help young people thrive emotionally, socially, and personally.',
    programs: [
      { title: 'Hair Braiding Academy', slug: 'hair-braiding-academy', description: 'Teaches young people practical hair braiding techniques while celebrating African culture, creativity, and identity, including hygiene, customer care, confidence building, and entrepreneurship basics.' },
      { title: 'Under the Bonnet', slug: 'under-the-bonnet', description: 'A practical and empowering program introducing young people to basic vehicle maintenance, safety awareness, and essential life skills.' },
      { title: 'Makeup Class', slug: 'makeup-class', description: 'Hands-on beauty training covering makeup application techniques, skincare basics, hygiene practices, and creative beauty skills, with a focus on confidence and entrepreneurship.' },
      { title: 'Cooking and Pastry Baking', slug: 'cooking-and-pastry-baking', description: 'A practical life skills program teaching cooking, baking, nutrition awareness, kitchen safety, meal preparation, and teamwork.' },
      { title: 'One on One Mentoring', slug: 'one-on-one-mentoring', description: 'Provides young people with guidance, encouragement, emotional support, and positive role models to build confidence and set goals.' },
    ],
  },
  {
    title: 'Community Mental Health and Wellbeing Initiative',
    slug: 'mental-health-wellbeing',
    tagline: 'Supporting wellbeing, connection, and healthier communities.',
    description:
      'Focuses on reducing isolation, improving emotional wellbeing, encouraging social connection, and creating safe spaces where individuals feel supported and valued through social activities, movement, conversations, peer support, and community engagement.',
    programs: [
      { title: 'Afro Dance Exercise', slug: 'afro-dance-exercise', description: 'Combines fitness, music, culture, and fun to improve physical and mental wellbeing in a culturally inclusive environment.' },
      { title: 'Cozy Corner', slug: 'cozy-corner', description: 'A safe and welcoming community space where individuals can relax, connect, share experiences, and receive peer support.' },
    ],
  },
  {
    title: 'Little Stars Initiative',
    slug: 'little-stars',
    tagline: 'Inspiring the leaders of tomorrow.',
    description:
      'Designed to nurture, inspire, and support children aged 5-12 through educational, creative, recreational, and developmental activities in a safe and inclusive environment.',
    programs: [
      { title: 'STEM Club', slug: 'stem-club', description: 'Introduces children to science, technology, engineering, and mathematics through hands-on activities, experiments, games, and creative learning.' },
      { title: 'Fun Outings', slug: 'fun-outings', description: 'Educational and recreational outings including cinema trips, parks, museums, activity centres, and family experiences.' },
    ],
  },
  {
    title: 'FirstPass Football Academy',
    slug: 'firstpass-football',
    tagline: 'Together through Football.',
    description:
      'Weekly football training sessions focus on skill development, teamwork, fitness, confidence, leadership, discipline, and sportsmanship.',
    programs: [
      { title: 'Football', slug: 'football', description: 'Weekly training sessions building friendships and positive engagement through football.' },
    ],
  },
  {
    title: 'Food Bank & Café',
    slug: 'food-bank-cafe',
    tagline: 'Sharing meals, spreading hope.',
    description:
      'Supports families and individuals experiencing hardship, food insecurity, isolation, or financial difficulties through weekly meal support, refreshments, conversations, and community engagement.',
    programs: [
      { title: 'Weekly Community Meals', slug: 'weekly-community-meals', description: 'Meals once a week for families in need and isolated individuals, with an emphasis on social connection and community bonding.' },
    ],
  },
];

const IMPACT_STATS = [
  { label: 'Families Supported', value: 1000 },
  { label: 'Young People Engaged', value: 250 },
  { label: 'Community Events Hosted', value: 30 },
  { label: 'Volunteers Involved', value: 30 },
];

const RESOURCES = [
  { title: 'Safeguarding Policy', category: 'Policy' },
  { title: 'Code of Conduct', category: 'Policy' },
  { title: 'Consent Policy', category: 'Policy' },
  { title: 'GDPR Compliance', category: 'Policy' },
  { title: 'Donation Disclaimer', category: 'Policy' },
  { title: 'Terms', category: 'Legal' },
  { title: 'Privacy Policy', category: 'Legal' },
  { title: 'Cookie Policy', category: 'Legal' },
];

const SITE_SETTINGS = {
  charity_name: 'Hope For Families',
  charity_number: 'SC053715',
  tagline: 'Building Stronger Families, Empowered Communities & Brighter Futures',
  subheading:
    'Hope For Families is a community-led charity supporting African and ethnic minority families, children, and young people through inclusive programs, wellbeing support, empowerment initiatives, and meaningful opportunities that promote connection, growth, and belonging.',
  instagram_url: 'https://www.instagram.com/hopeforfamilies',
  facebook_url: 'https://www.facebook.com/share/1EiJxZpgKo/?mibextid=wwXIfr',
  tiktok_url: 'https://www.tiktok.com/@hopeforfamiliesdundee',
};

async function seed() {
  const conn = await pool.getConnection();
  try {
    const [users] = await conn.query('SELECT id FROM users WHERE email = ?', [process.env.ADMIN_SEED_EMAIL]);
    if (users.length === 0) {
      const hash = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD, 10);
      await conn.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Hope For Families Admin', process.env.ADMIN_SEED_EMAIL, hash, 'super_admin']
      );
      console.log(`Seeded super_admin user: ${process.env.ADMIN_SEED_EMAIL}`);
    } else {
      console.log('Admin user already exists, skipping.');
    }

    for (const [i, initiative] of INITIATIVES.entries()) {
      const [rows] = await conn.query('SELECT id FROM initiatives WHERE slug = ?', [initiative.slug]);
      let initiativeId = rows[0]?.id;
      if (!initiativeId) {
        const [result] = await conn.query(
          'INSERT INTO initiatives (title, slug, tagline, description, sort_order) VALUES (?, ?, ?, ?, ?)',
          [initiative.title, initiative.slug, initiative.tagline, initiative.description, i]
        );
        initiativeId = result.insertId;
        console.log(`Seeded initiative: ${initiative.title}`);
      }

      for (const [j, program] of initiative.programs.entries()) {
        const [progRows] = await conn.query(
          'SELECT id FROM programs WHERE initiative_id = ? AND slug = ?',
          [initiativeId, program.slug]
        );
        if (progRows.length === 0) {
          await conn.query(
            'INSERT INTO programs (initiative_id, title, slug, description, sort_order) VALUES (?, ?, ?, ?, ?)',
            [initiativeId, program.title, program.slug, program.description, j]
          );
        }
      }
    }

    for (const [i, stat] of IMPACT_STATS.entries()) {
      const [rows] = await conn.query('SELECT id FROM impact_stats WHERE label = ?', [stat.label]);
      if (rows.length === 0) {
        await conn.query(
          'INSERT INTO impact_stats (label, value, sort_order) VALUES (?, ?, ?)',
          [stat.label, stat.value, i]
        );
      }
    }

    for (const resource of RESOURCES) {
      const [rows] = await conn.query('SELECT id FROM resources WHERE title = ?', [resource.title]);
      if (rows.length === 0) {
        await conn.query(
          'INSERT INTO resources (title, file_url, category) VALUES (?, ?, ?)',
          [resource.title, '', resource.category]
        );
      }
    }

    for (const [key, value] of Object.entries(SITE_SETTINGS)) {
      await conn.query(
        'INSERT INTO site_settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
        [key, value]
      );
    }

    console.log('Seed complete.');
  } finally {
    conn.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
