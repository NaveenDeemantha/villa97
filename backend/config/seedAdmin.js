const db = require('../config/database');
const bcrypt = require('bcrypt');

// Admin user configuration
const ADMIN_CONFIG = {
  name: 'Admin',
  email: 'admin@villa97.com',
  password: 'admin123', // Change this in production!
  phone: '+94123456789',
  role: 'admin'
};

async function createAdminUser() {
  try {
    console.log('🔄 Checking for existing admin user...');

    // Check if admin user already exists
    const existingAdmin = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [ADMIN_CONFIG.email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists!');
      console.log(`   Email: ${ADMIN_CONFIG.email}`);
      console.log(`   Role: ${existingAdmin.rows[0].role}`);
      return existingAdmin.rows[0];
    }

    console.log('🔄 Creating admin user...');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, salt);

    // Create admin user
    const query = `
      INSERT INTO users (name, email, password, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, role, created_at
    `;

    const result = await db.query(query, [
      ADMIN_CONFIG.name,
      ADMIN_CONFIG.email,
      hashedPassword,
      ADMIN_CONFIG.phone,
      ADMIN_CONFIG.role
    ]);

    const adminUser = result.rows[0];

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('='.repeat(60));
    console.log('📋 ADMIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log(`Email:    ${ADMIN_CONFIG.email}`);
    console.log(`Password: ${ADMIN_CONFIG.password}`);
    console.log(`Role:     ${adminUser.role}`);
    console.log('='.repeat(60));
    console.log('');
    console.log('⚠️  IMPORTANT: Change the admin password after first login!');
    console.log('');

    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  } finally {
    // Close database connection
    await db.end();
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('✅ Seed script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed script failed:', error);
      process.exit(1);
    });
}

module.exports = createAdminUser;
