#!/usr/bin/env node

/**
 * Helper script to generate bcrypt password hash for authentication
 *
 * Usage:
 *   node hash-password.js YourPasswordHere
 *
 * The generated hash should be added to .env as AUTH_PASSWORD_HASH
 */

import bcrypt from 'bcrypt';

const password = process.argv[2];

if (!password) {
  console.error('Error: Password argument is required');
  console.log('\nUsage:');
  console.log('  node hash-password.js YourPasswordHere');
  console.log('\nExample:');
  console.log('  node hash-password.js MySecurePassword123');
  process.exit(1);
}

const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }

  console.log('\n✓ Password hash generated successfully!');
  console.log('\nAdd this to your .env file:');
  console.log('━'.repeat(60));
  console.log(`AUTH_PASSWORD_HASH=${hash}`);
  console.log('━'.repeat(60));
  console.log('\nAlso remember to set JWT_SECRET:');
  console.log('Run: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  console.log('\n');
});
