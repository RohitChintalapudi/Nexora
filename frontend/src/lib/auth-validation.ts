/**
 * Authentication and input validation utilities for Nexora
 */

export type PasswordStrengthCategory = 'Easy' | 'Medium' | 'Hard';

export interface PasswordAnalysis {
  score: number; // 0 (empty), 1 (Easy), 2 (Medium), 3 (Hard)
  category: PasswordStrengthCategory | null;
  hasMinLength: boolean; // >= 8 chars
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  feedback: string;
}

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Strict RFC-compliant email validation helper
 */
export function validateEmail(email: string): EmailValidationResult {
  const trimmed = (email || '').trim();

  if (!trimmed) {
    return { isValid: false, error: 'Email address is required' };
  }

  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  if (/\s/.test(trimmed)) {
    return { isValid: false, error: 'Email cannot contain spaces' };
  }

  if (!trimmed.includes('@')) {
    return { isValid: false, error: 'Email must contain "@"' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Email must contain only one "@"' };
  }

  const [localPart, domainPart] = parts;

  if (!localPart || localPart.length === 0) {
    return { isValid: false, error: 'Email username cannot be empty' };
  }

  if (!domainPart || !domainPart.includes('.')) {
    return { isValid: false, error: 'Domain must include a dot (e.g. .com, .io)' };
  }

  const domainParts = domainPart.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (!tld || tld.length < 2) {
    return { isValid: false, error: 'Domain extension must be at least 2 letters (e.g. .io, .com)' };
  }

  // General standard email pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@company.com)' };
  }

  return { isValid: true };
}

/**
 * Categorizes password strength into 3 sections:
 * 1 Dot: Easy (Red)
 * 2 Dots: Medium (Green)
 * 3 Dots: Hard (Green)
 */
export function analyzePassword(password: string): PasswordAnalysis {
  if (!password || password.length === 0) {
    return {
      score: 0,
      category: null,
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
      feedback: 'Enter a password',
    };
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const criteriaCount = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;

  let score = 1;
  let category: PasswordStrengthCategory = 'Easy';
  let feedback = 'Weak password';

  if (password.length < 6) {
    score = 1;
    category = 'Easy';
    feedback = 'Too short';
  } else if (password.length < 8) {
    if (criteriaCount >= 3) {
      score = 2;
      category = 'Medium';
      feedback = 'Moderate password';
    } else {
      score = 1;
      category = 'Easy';
      feedback = 'Easy password';
    }
  } else {
    // Length >= 8
    if (criteriaCount >= 3 || (criteriaCount >= 2 && password.length >= 10)) {
      score = 3;
      category = 'Hard';
      feedback = 'Strong password';
    } else if (criteriaCount >= 2) {
      score = 2;
      category = 'Medium';
      feedback = 'Moderate password';
    } else {
      score = 1;
      category = 'Easy';
      feedback = 'Easy password';
    }
  }

  return {
    score,
    category,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    feedback,
  };
}
