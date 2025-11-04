const { User, Job, Application, SavedJob, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

console.log('🚀 Starting database seeding...');

const seedDatabase = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established!');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Application.destroy({ where: {}, transaction });
    console.log('  - Cleared applications');
    await SavedJob.destroy({ where: {}, transaction });
    console.log('  - Cleared saved jobs');
    await Job.destroy({ where: {}, transaction });
    console.log('  - Cleared jobs');
    await User.destroy({ where: {}, transaction });
    console.log('  - Cleared users');
    console.log('✅ Database cleared successfully!');

    // Create users
    console.log('👥 Creating users...');
    const users = await User.bulkCreate([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        is_active: true
      },
      {
        name: 'Tech Corp',
        email: 'employer@techcorp.com',
        password: await bcrypt.hash('employer123', 10),
        role: 'employer',
        profile_data: {
          company: 'Tech Corp',
          website: 'https://techcorp.com',
          description: 'Leading technology solutions provider',
          logo: 'https://via.placeholder.com/150'
        },
        is_active: true
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'job_seeker',
        profile_data: {
          title: 'Senior Software Engineer',
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          experience: '5+ years',
          resume_url: 'https://example.com/resumes/john_doe.pdf'
        },
        is_active: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'job_seeker',
        profile_data: {
          title: 'UX/UI Designer',
          skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research'],
          experience: '3+ years',
          resume_url: 'https://example.com/resumes/jane_smith.pdf'
        },
        is_active: true
      }
    ], { transaction });
    console.log(`✅ Created ${users.length} users`);

// Create jobs
console.log('💼 Creating jobs...');
// Update the job data to use camelCase field names
const jobData = [
  {
    title: 'Senior Full Stack Developer',
    description: 'We are looking for an experienced Full Stack Developer...',
    location: 'New York, NY',
    jobType: 'full-time',
    salaryRange: { min: 100000, max: 150000, currency: 'USD', period: 'year' },
    skills: ['JavaScript', 'React', 'Node.js', 'Express', 'PostgreSQL'],
    experienceLevel: 'senior',
    isRemote: true,
    status: 'published',
    employer_id: users[1].id,
    applicationDeadline: new Date('2025-12-31')
  },
  {
    title: 'Frontend Developer (React)',
    description: 'Join our frontend team to build amazing user interfaces...',
    location: 'San Francisco, CA',
    jobType: 'full-time',
    salaryRange: { min: 90000, max: 130000, currency: 'USD', period: 'year' },
    skills: ['JavaScript', 'React', 'Redux', 'TypeScript', 'CSS'],
    experienceLevel: 'mid',
    isRemote: true,
    status: 'published',
    employer_id: users[1].id,
    applicationDeadline: new Date('2025-11-30')
  }
];

// Create jobs one by one to ensure all fields are included
const jobs = [];
for (const job of jobData) {
  const createdJob = await Job.create(job, { transaction });
  jobs.push(createdJob);
  console.log(`  - Created job: ${createdJob.title}`);
}
console.log(`✅ Created ${jobs.length} jobs`);

    // Create applications
    console.log('📝 Creating applications...');
    const applications = await Application.bulkCreate([
      {
        job_id: jobs[0].id,
        applicant_id: users[2].id,
        cover_letter: 'I am excited to apply for the Senior Full Stack Developer position...',
        status: 'pending'
      },
      {
        job_id: jobs[1].id,
        applicant_id: users[3].id,
        cover_letter: 'I am very interested in the Frontend Developer position...',
        status: 'reviewed'
      }
    ], { transaction });
    console.log(`✅ Created ${applications.length} applications`);

    // Create saved jobs
    console.log('🔖 Creating saved jobs...');
    const savedJobs = await SavedJob.bulkCreate([
      {
        user_id: users[2].id,
        job_id: jobs[1].id,
        notes: 'Great opportunity with a good tech stack'
      },
      {
        user_id: users[3].id,
        job_id: jobs[0].id,
        notes: 'Interesting position, but requires more backend experience'
      }
    ], { transaction });
    console.log(`✅ Created ${savedJobs.length} saved jobs`);

    await transaction.commit();
    console.log('✨ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error seeding database:');
    console.error(error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();