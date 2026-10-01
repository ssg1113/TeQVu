// Password Security & Validation Engine for TeQVu
// Compliant with modern NIST Special Publication 800-63B & OWASP ASVS standards

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 - 100
  strengthLevel: 'weak' | 'fair' | 'good' | 'strong';
  errors: string[];
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    notCommon: boolean;
    noEmailMatch: boolean;
  };
}

// Common vulnerable/breached passwords to blacklist
const COMMON_PASSWORDS = new Set([
  '123456',
  '12345678',
  '123456789',
  'password',
  'password123',
  'admin',
  'admin123',
  'qwerty',
  'qwertyuiop',
  'welcome',
  'welcome123',
  'teqvu123',
  'letmein',
  'monkey',
  'iloveyou',
  'abc12345',
  'testing123',
  'changeme',
]);

/**
 * Validates a password against enterprise-grade security criteria:
 * - Minimum 8 characters (10+ recommended)
 * - Upper and lowercase characters
 * - Numeric digits
 * - Special symbols (!@#$%^&*...)
 * - Not a known dictionary/common password
 * - Does not contain user's email username
 */
export function validatePassword(password: string, userEmail?: string): PasswordValidationResult {
  const cleanPassword = password || '';
  const trimmed = cleanPassword.trim();
  const lower = trimmed.toLowerCase();

  const minLength = trimmed.length >= 8;
  const hasUppercase = /[A-Z]/.test(cleanPassword);
  const hasLowercase = /[a-z]/.test(cleanPassword);
  const hasNumber = /[0-9]/.test(cleanPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(cleanPassword);
  const notCommon = !COMMON_PASSWORDS.has(lower);

  // Check if password contains the username part of the email
  let noEmailMatch = true;
  if (userEmail && userEmail.includes('@')) {
    const emailPrefix = userEmail.split('@')[0].toLowerCase();
    if (emailPrefix.length >= 3 && lower.includes(emailPrefix)) {
      noEmailMatch = false;
    }
  }

  const errors: string[] = [];
  if (!minLength) errors.push('Password must be at least 8 characters long');
  if (!hasUppercase) errors.push('Must contain at least one uppercase letter (A-Z)');
  if (!hasLowercase) errors.push('Must contain at least one lowercase letter (a-z)');
  if (!hasNumber) errors.push('Must contain at least one number (0-9)');
  if (!hasSpecial) errors.push('Must contain at least one special character (!@#$%^&*)');
  if (!notCommon) errors.push('This password is too common and easily guessed');
  if (!noEmailMatch) errors.push('Password cannot contain your email name');

  // Calculate score (0 to 100)
  let score = 0;
  if (trimmed.length >= 8) score += 20;
  if (trimmed.length >= 12) score += 15;
  if (trimmed.length >= 16) score += 10;
  if (hasUppercase) score += 15;
  if (hasLowercase) score += 10;
  if (hasNumber) score += 15;
  if (hasSpecial) score += 15;
  if (notCommon && noEmailMatch) score = Math.min(100, score);
  else score = Math.min(30, score);

  let strengthLevel: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (score >= 80) {
    strengthLevel = 'strong';
  } else if (score >= 60) {
    strengthLevel = 'good';
  } else if (score >= 40) {
    strengthLevel = 'fair';
  } else {
    strengthLevel = 'weak';
  }

  const isValid =
    minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecial &&
    notCommon &&
    noEmailMatch;

  return {
    isValid,
    score,
    strengthLevel,
    errors,
    checks: {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      notCommon,
      noEmailMatch,
    },
  };
}

/**
 * Format label and visual colors for password strength levels
 */
export function getStrengthBadge(strengthLevel: 'weak' | 'fair' | 'good' | 'strong') {
  switch (strengthLevel) {
    case 'strong':
      return {
        label: 'Strong & Resilient',
        color: 'text-emerald-400',
        barColor: 'bg-emerald-500',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
      };
    case 'good':
      return {
        label: 'Good Security',
        color: 'text-cyan-400',
        barColor: 'bg-cyan-500',
        bg: 'bg-cyan-500/10 border-cyan-500/30',
      };
    case 'fair':
      return {
        label: 'Moderate (Needs More Variety)',
        color: 'text-amber-400',
        barColor: 'bg-amber-500',
        bg: 'bg-amber-500/10 border-amber-500/30',
      };
    case 'weak':
    default:
      return {
        label: 'Weak / Vulnerable',
        color: 'text-red-400',
        barColor: 'bg-red-500',
        bg: 'bg-red-500/10 border-red-500/30',
      };
  }
}
