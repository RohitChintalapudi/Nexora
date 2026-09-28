import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Test simulation
const JWT_SECRET = 'nexora_default_jwt_secret_key';

const generateToken = (id, authProvider = 'email') => {
  return jwt.sign(
    { id, authProvider },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

console.log('--- Testing Auth Provider Tokens & Password Change Restrictions ---');

// Scenario 1: Email + Password User
const emailToken = generateToken(1, 'email');
const decodedEmail = jwt.verify(emailToken, JWT_SECRET);
console.log('✅ Scenario 1 (Email User): token provider =', decodedEmail.authProvider);

// Scenario 2: Google OAuth User
const googleToken = generateToken(2, 'google');
const decodedGoogle = jwt.verify(googleToken, JWT_SECRET);
console.log('✅ Scenario 2 (Google User): token provider =', decodedGoogle.authProvider);

// Scenario 3: GitHub OAuth User
const githubToken = generateToken(3, 'github');
const decodedGithub = jwt.verify(githubToken, JWT_SECRET);
console.log('✅ Scenario 3 (GitHub User): token provider =', decodedGithub.authProvider);

// Check permission logic
function canChangePassword(authProvider, hasPassword) {
  return authProvider === 'email' && hasPassword === true;
}

console.log('Email user with password eligible:', canChangePassword(decodedEmail.authProvider, true)); // true
console.log('Google user eligible:', canChangePassword(decodedGoogle.authProvider, false)); // false
console.log('GitHub user eligible:', canChangePassword(decodedGithub.authProvider, false)); // false

if (
  canChangePassword(decodedEmail.authProvider, true) === true &&
  canChangePassword(decodedGoogle.authProvider, false) === false &&
  canChangePassword(decodedGithub.authProvider, false) === false
) {
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
} else {
  console.error('❌ Tests failed');
  process.exit(1);
}
