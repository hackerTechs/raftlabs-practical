const {
  isNonEmptyString,
  isValidEmail,
  isValidPhone,
  isPositiveInteger,
  sanitizeString,
  sanitizePhone,
  stripTags,
} = require('../src/middleware/validator');

describe('Validator Utilities', () => {
  // ── isNonEmptyString ────────────────────────────────────────────────────
  describe('isNonEmptyString', () => {
    it('should return true for valid strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString(' hello ')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(123)).toBe(false);
      expect(isNonEmptyString({})).toBe(false);
      expect(isNonEmptyString([])).toBe(false);
    });
  });

  // ── isValidEmail ──────────────────────────────────────────────────────
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('user@test.com')).toBe(true);
      expect(isValidEmail('admin@mail.com')).toBe(true);
      expect(isValidEmail('a.b@c.co')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('user @mail.com')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
      expect(isValidEmail(123)).toBe(false);
    });
  });

  // ── isValidPhone (+91 XXXXX XXXXX format) ─────────────────────────────
  describe('isValidPhone', () => {
    it('should accept correctly formatted phone +91 XXXXX XXXXX', () => {
      expect(isValidPhone('+91 98765 43210')).toBe(true);
      expect(isValidPhone('+91 61234 56789')).toBe(true);
      expect(isValidPhone('+91 70000 00000')).toBe(true);
    });

    it('should reject plain digits', () => {
      expect(isValidPhone('919876543210')).toBe(false);
    });

    it('should reject US-format numbers', () => {
      expect(isValidPhone('+1 234 567 8901')).toBe(false);
    });

    it('should reject wrong country code', () => {
      expect(isValidPhone('+44 98765 43210')).toBe(false);
    });

    it('should reject number starting with 0-5', () => {
      expect(isValidPhone('+91 01234 56789')).toBe(false);
      expect(isValidPhone('+91 51234 56789')).toBe(false);
    });

    it('should reject incomplete number', () => {
      expect(isValidPhone('+91 98765')).toBe(false);
    });

    it('should reject too many digits', () => {
      expect(isValidPhone('+91 98765 432109')).toBe(false);
    });

    it('should reject missing country code', () => {
      expect(isValidPhone('+98765 43210')).toBe(false);
    });

    it('should reject empty / whitespace', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('   ')).toBe(false);
    });

    it('should reject letters', () => {
      expect(isValidPhone('+91 98abc defgh')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidPhone(null)).toBe(false);
      expect(isValidPhone(undefined)).toBe(false);
      expect(isValidPhone(1234567)).toBe(false);
    });
  });

  // ── isPositiveInteger ──────────────────────────────────────────────────
  describe('isPositiveInteger', () => {
    it('should return true for positive integers', () => {
      expect(isPositiveInteger(1)).toBe(true);
      expect(isPositiveInteger(99)).toBe(true);
    });

    it('should return false for non-positive or non-integer values', () => {
      expect(isPositiveInteger(0)).toBe(false);
      expect(isPositiveInteger(-1)).toBe(false);
      expect(isPositiveInteger(1.5)).toBe(false);
      expect(isPositiveInteger('1')).toBe(false);
      expect(isPositiveInteger(null)).toBe(false);
    });
  });

  // ── sanitizeString ──────────────────────────────────────────────────────
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should collapse multiple spaces', () => {
      expect(sanitizeString('hello   world')).toBe('hello world');
    });

    it('should strip HTML tags', () => {
      expect(sanitizeString('<b>bold</b>')).toBe('bold');
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")');
    });

    it('should handle mixed content', () => {
      expect(sanitizeString('  <b>John</b>   Doe  ')).toBe('John Doe');
    });

    it('should return non-string values unchanged', () => {
      expect(sanitizeString(123)).toBe(123);
      expect(sanitizeString(null)).toBe(null);
    });
  });

  // ── sanitizePhone ──────────────────────────────────────────────────────
  describe('sanitizePhone', () => {
    it('should format raw 12 digits into +91 XXXXX XXXXX', () => {
      expect(sanitizePhone('919876543210')).toBe('+91 98765 43210');
    });

    it('should extract digits from a formatted phone and reformat', () => {
      expect(sanitizePhone('+91 98765 43210')).toBe('+91 98765 43210');
    });

    it('should strip letters and special chars then format', () => {
      expect(sanitizePhone('+91abc98765def43210')).toBe('+91 98765 43210');
    });

    it('should handle partial input', () => {
      expect(sanitizePhone('91')).toBe('+91');
      expect(sanitizePhone('919')).toBe('+91 9');
    });

    it('should return empty string for no digits', () => {
      expect(sanitizePhone('abc')).toBe('');
    });

    it('should cap at 12 digits', () => {
      expect(sanitizePhone('91987654321099')).toBe('+91 98765 43210');
    });

    it('should trim whitespace', () => {
      expect(sanitizePhone('  919876543210  ')).toBe('+91 98765 43210');
    });

    it('should return non-string values unchanged', () => {
      expect(sanitizePhone(123)).toBe(123);
      expect(sanitizePhone(null)).toBe(null);
    });
  });

  // ── stripTags ──────────────────────────────────────────────────────────
  describe('stripTags', () => {
    it('should remove HTML tags', () => {
      expect(stripTags('<p>Hello</p>')).toBe('Hello');
    });

    it('should remove script tags', () => {
      expect(stripTags('<script>alert(1)</script>')).toBe('alert(1)');
    });

    it('should handle nested tags', () => {
      expect(stripTags('<div><span>Hi</span></div>')).toBe('Hi');
    });

    it('should leave plain text untouched', () => {
      expect(stripTags('Hello World')).toBe('Hello World');
    });
  });
});
