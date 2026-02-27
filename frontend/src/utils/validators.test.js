import { describe, it, expect } from 'vitest';
import {
  validateCheckoutForm,
  validatePhone,
  formatPhoneInput,
  formatCurrency,
} from './validators';

// ── formatPhoneInput (auto-formatter) ──────────────────────────────────────
describe('formatPhoneInput', () => {
  it('should return empty string for empty input', () => {
    expect(formatPhoneInput('')).toBe('');
  });

  it('should format a single digit with + prefix', () => {
    expect(formatPhoneInput('9')).toBe('+9');
  });

  it('should format country code (2 digits)', () => {
    expect(formatPhoneInput('91')).toBe('+91');
  });

  it('should add space after country code', () => {
    expect(formatPhoneInput('919')).toBe('+91 9');
  });

  it('should format first local group partially', () => {
    expect(formatPhoneInput('91987')).toBe('+91 987');
  });

  it('should format first local group (5 digits)', () => {
    expect(formatPhoneInput('9198765')).toBe('+91 98765');
  });

  it('should add space before second local group', () => {
    expect(formatPhoneInput('91987654')).toBe('+91 98765 4');
  });

  it('should format complete number', () => {
    expect(formatPhoneInput('919876543210')).toBe('+91 98765 43210');
  });

  it('should cap at 12 digits', () => {
    expect(formatPhoneInput('91987654321099')).toBe('+91 98765 43210');
  });

  it('should strip non-digit characters from input', () => {
    expect(formatPhoneInput('+91 98765 43210')).toBe('+91 98765 43210');
    expect(formatPhoneInput('abc91def98765ghi43210')).toBe('+91 98765 43210');
  });

  it('should handle pasted formatted numbers', () => {
    expect(formatPhoneInput('+91-98765-43210')).toBe('+91 98765 43210');
    expect(formatPhoneInput('(91) 98765 43210')).toBe('+91 98765 43210');
  });
});

// ── validatePhone ──────────────────────────────────────────────────────────
describe('validatePhone', () => {
  it('should accept correctly formatted phone', () => {
    expect(validatePhone('+91 98765 43210').valid).toBe(true);
  });

  it('should accept another valid number', () => {
    expect(validatePhone('+91 61234 56789').valid).toBe(true);
  });

  it('should accept number starting with 7', () => {
    expect(validatePhone('+91 71234 56789').valid).toBe(true);
  });

  it('should accept number starting with 8', () => {
    expect(validatePhone('+91 81234 56789').valid).toBe(true);
  });

  // Invalid
  it('should reject empty string', () => {
    const result = validatePhone('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should reject null', () => {
    expect(validatePhone(null).valid).toBe(false);
  });

  it('should reject undefined', () => {
    expect(validatePhone(undefined).valid).toBe(false);
  });

  it('should reject whitespace-only', () => {
    expect(validatePhone('   ').valid).toBe(false);
  });

  it('should reject wrong format — plain digits', () => {
    const result = validatePhone('919876543210');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('+91 XXXXX XXXXX');
  });

  it('should reject wrong format — US number', () => {
    expect(validatePhone('+1 234 567 8901').valid).toBe(false);
  });

  it('should reject number starting with 0-5', () => {
    expect(validatePhone('+91 01234 56789').valid).toBe(false);
    expect(validatePhone('+91 51234 56789').valid).toBe(false);
  });

  it('should reject incomplete number', () => {
    expect(validatePhone('+91 98765').valid).toBe(false);
  });

  it('should reject too many digits', () => {
    expect(validatePhone('+91 98765 432109').valid).toBe(false);
  });

  it('should reject missing country code', () => {
    expect(validatePhone('+98765 43210').valid).toBe(false);
  });

  it('should reject wrong country code', () => {
    expect(validatePhone('+44 98765 43210').valid).toBe(false);
  });

  it('should reject letters mixed in', () => {
    expect(validatePhone('+91 98abc defgh').valid).toBe(false);
  });
});

// ── validateCheckoutForm ───────────────────────────────────────────────────
describe('validateCheckoutForm', () => {
  const validForm = {
    name: 'John Doe',
    address: '123 Main Street, Apt 4',
    phone: '+91 98765 43210',
  };

  it('should return no errors for valid form', () => {
    const errors = validateCheckoutForm(validForm);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  // ── Name validation ──────────────────────────────────────────────────
  it('should require name', () => {
    const errors = validateCheckoutForm({ ...validForm, name: '' });
    expect(errors.name).toBeDefined();
  });

  it('should reject whitespace-only name', () => {
    const errors = validateCheckoutForm({ ...validForm, name: '   ' });
    expect(errors.name).toBeDefined();
  });

  it('should reject name shorter than 2 chars', () => {
    const errors = validateCheckoutForm({ ...validForm, name: 'A' });
    expect(errors.name).toContain('2');
  });

  it('should reject name longer than 100 chars', () => {
    const errors = validateCheckoutForm({ ...validForm, name: 'A'.repeat(101) });
    expect(errors.name).toContain('100');
  });

  // ── Address validation ───────────────────────────────────────────────
  it('should require address', () => {
    const errors = validateCheckoutForm({ ...validForm, address: '' });
    expect(errors.address).toBeDefined();
  });

  it('should reject address shorter than 5 chars', () => {
    const errors = validateCheckoutForm({ ...validForm, address: '12' });
    expect(errors.address).toContain('5');
  });

  it('should reject address longer than 300 chars', () => {
    const errors = validateCheckoutForm({ ...validForm, address: 'A'.repeat(301) });
    expect(errors.address).toContain('300');
  });

  // ── Phone validation ─────────────────────────────────────────────────
  it('should require phone', () => {
    const errors = validateCheckoutForm({ ...validForm, phone: '' });
    expect(errors.phone).toBeDefined();
  });

  it('should reject incorrect phone format', () => {
    const errors = validateCheckoutForm({ ...validForm, phone: '1234567890' });
    expect(errors.phone).toBeDefined();
  });

  it('should accept valid +91 XXXXX XXXXX phone', () => {
    const errors = validateCheckoutForm({ ...validForm, phone: '+91 71234 56789' });
    expect(errors.phone).toBeUndefined();
  });

  // ── Multiple errors ─────────────────────────────────────────────────
  it('should return multiple errors at once', () => {
    const errors = validateCheckoutForm({ name: '', address: '', phone: '' });
    expect(Object.keys(errors)).toHaveLength(3);
  });
});

// ── formatCurrency ─────────────────────────────────────────────────────────
describe('formatCurrency', () => {
  it('should format as USD', () => {
    expect(formatCurrency(12.99)).toBe('$12.99');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format large amounts', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });
});
