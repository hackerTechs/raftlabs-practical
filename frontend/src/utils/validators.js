/**
 * Fixed phone format: +91 XXXXX XXXXX  (Indian mobile)
 *
 *   +91    – country code
 *   [6-9]  – first digit of local number (Indian mobile starts with 6–9)
 *   XXXX   – remaining 4 digits of first group
 *   XXXXX  – second group (5 digits)
 *
 * Total: 12 digits (2 country + 10 local).
 */

const PHONE_REGEX = /^\+91 [6-9]\d{4} \d{5}$/;
const PHONE_DIGIT_COUNT = 12;

/**
 * Auto-format a raw input value into +91 XXXXX XXXXX as the user types.
 *
 * Strips everything except digits, caps at 12, and inserts the `+` and
 * spaces in the right places.
 *
 * @param {string} value – raw input value (may contain partial formatting)
 * @returns {string} formatted phone string
 */
export function formatPhoneInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, PHONE_DIGIT_COUNT);
  if (digits.length === 0) return '';

  let result = '+';
  for (let i = 0; i < digits.length; i++) {
    // Insert spaces before positions 2 (local start) and 7 (second group)
    if (i === 2 || i === 7) result += ' ';
    result += digits[i];
  }
  return result;
}

/**
 * Validate a phone number against the fixed +91 XXXXX XXXXX format.
 *
 * @param {string} phone
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return { valid: false, error: 'Phone number is required' };
  }

  const trimmed = phone.trim();

  if (!PHONE_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Phone must be in +91 XXXXX XXXXX format',
    };
  }

  return { valid: true };
}

/**
 * Validate checkout form fields.
 * Returns an object of field → error message (empty if valid).
 */
export function validateCheckoutForm({ name, address, phone }) {
  const errors = {};

  // Name
  if (!name || !name.trim()) {
    errors.name = 'Name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.trim().length > 100) {
    errors.name = 'Name must be under 100 characters';
  }

  // Address
  if (!address || !address.trim()) {
    errors.address = 'Delivery address is required';
  } else if (address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters';
  } else if (address.trim().length > 300) {
    errors.address = 'Address must be under 300 characters';
  }

  // Phone — use the dedicated validator
  const phoneResult = validatePhone(phone);
  if (!phoneResult.valid) {
    errors.phone = phoneResult.error;
  }

  return errors;
}

/**
 * Format currency.
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
