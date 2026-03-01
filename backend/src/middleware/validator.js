const { AppError } = require('./errorHandler');

// ─── Constants ─────────────────────────────────────────────────────────────

/**
 * Fixed phone format: +91 XXXXX XXXXX  (Indian mobile)
 *
 *   +91    – country code
 *   [6-9]  – first digit of local number (Indian mobile starts with 6–9)
 *   XXXX   – remaining digits of first group
 *   XXXXX  – second group (5 digits)
 *
 * Total: 12 digits (2 country + 10 local).
 */
const PHONE_REGEX = /^\+91 [6-9]\d{4} \d{5}$/;

// ─── Utility helpers ───────────────────────────────────────────────────────

/**
 * Validates that a value is a non-empty string.
 */
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

/**
 * Validates an email address (basic).
 */
const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Validates a phone number against the fixed +91 XXXXX XXXXX format.
 */
const isValidPhone = (phone) => {
  if (typeof phone !== 'string') return false;
  return PHONE_REGEX.test(phone.trim());
};

/**
 * Validates that quantity is a positive integer.
 */
const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

// ─── Sanitisation helpers ──────────────────────────────────────────────────

/**
 * Strip HTML/script tags from a string.
 */
const stripTags = (str) => str.replace(/<[^>]*>/g, '');

/**
 * Sanitise a plain-text string field: trim whitespace, strip HTML tags,
 * collapse multiple spaces.
 */
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return stripTags(value).replace(/\s+/g, ' ').trim();
};

/**
 * Sanitise a phone string: extract digits, cap at 12, and re-format
 * into the fixed +91 XXXXX XXXXX pattern (best-effort).
 */
const sanitizePhone = (value) => {
  if (typeof value !== 'string') return value;
  const digits = value.replace(/\D/g, '').slice(0, 12);
  if (digits.length === 0) return '';

  let result = '+';
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 7) result += ' ';
    result += digits[i];
  }
  return result;
};

// ─── Middleware: login ─────────────────────────────────────────────────────

/**
 * Middleware: validate login request body.
 */
const validateLoginBody = (req, _res, next) => {
  const { email } = req.body;

  if (!email || !isNonEmptyString(email)) {
    return next(new AppError('Email is required', 400));
  }

  if (!isValidEmail(email)) {
    return next(new AppError('Invalid email address', 400));
  }

  next();
};

// ─── Middleware: order placement (sanitise + validate) ─────────────────────

/**
 * Middleware: sanitise & validate order placement request body.
 *
 * 1. Whitelists allowed fields (items, customer).
 * 2. Sanitises all string inputs (strip tags, normalise).
 * 3. Validates every field.
 */
const validateOrderBody = (req, _res, next) => {
  const { items, customer } = req.body;

  // ── Items validation ────────────────────────────────────────────────────
  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('Items must be a non-empty array', 400));
  }

  if (items.length > 50) {
    return next(new AppError('Order cannot contain more than 50 line items', 400));
  }

  const sanitizedItems = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item || typeof item !== 'object') {
      return next(new AppError(`Item at index ${i}: must be an object`, 400));
    }

    // Sanitise menuItemId
    const menuItemId =
      typeof item.menuItemId === 'string' ? item.menuItemId.trim() : item.menuItemId;

    if (!menuItemId || !isNonEmptyString(String(menuItemId))) {
      return next(new AppError(`Item at index ${i}: menuItemId is required`, 400));
    }

    // Ensure menuItemId is alphanumeric / simple id (no injection)
    if (!/^[a-zA-Z0-9_-]+$/.test(String(menuItemId))) {
      return next(new AppError(`Item at index ${i}: menuItemId contains invalid characters`, 400));
    }

    if (item.quantity === undefined || item.quantity === null) {
      return next(new AppError(`Item at index ${i}: quantity is required`, 400));
    }

    if (!isPositiveInteger(item.quantity)) {
      return next(new AppError(`Item at index ${i}: quantity must be a positive integer`, 400));
    }

    if (item.quantity > 99) {
      return next(new AppError(`Item at index ${i}: quantity cannot exceed 99`, 400));
    }

    // Whitelist only expected fields per item
    sanitizedItems.push({ menuItemId: String(menuItemId), quantity: item.quantity });
  }

  // ── Customer validation & sanitisation ──────────────────────────────────
  if (!customer || typeof customer !== 'object') {
    return next(new AppError('Customer details are required', 400));
  }

  const name = sanitizeString(customer.name);
  const address = sanitizeString(customer.address);
  // Phone: sanitize by extracting digits and reformatting to +91 XXXXX XXXXX
  const phone = sanitizePhone(customer.phone);

  if (!name || !isNonEmptyString(name)) {
    return next(new AppError('Customer name is required', 400));
  }

  if (name.length < 2 || name.length > 100) {
    return next(new AppError('Customer name must be between 2 and 100 characters', 400));
  }

  if (!address || !isNonEmptyString(address)) {
    return next(new AppError('Delivery address is required', 400));
  }

  if (address.length < 5 || address.length > 300) {
    return next(new AppError('Address must be between 5 and 300 characters', 400));
  }

  if (!phone) {
    return next(new AppError('Phone number is required', 400));
  }

  if (!isValidPhone(phone)) {
    return next(new AppError('Phone must be in +91 XXXXX XXXXX format', 400));
  }

  // Replace req.body with sanitised & whitelisted data
  req.body = {
    items: sanitizedItems,
    customer: { name, address, phone },
  };

  next();
};

// ─── Middleware: status update ──────────────────────────────────────────────

/**
 * Middleware: validate order status update request body.
 */
const validateStatusUpdate = (req, _res, next) => {
  const { status } = req.body;
  const validStatuses = ['Order Received', 'Preparing', 'Out for Delivery', 'Delivered'];

  if (!status || !isNonEmptyString(status)) {
    return next(new AppError('Status is required', 400));
  }

  if (!validStatuses.includes(status)) {
    return next(
      new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400)
    );
  }

  // Whitelist body
  req.body = { status };

  next();
};

module.exports = {
  validateLoginBody,
  validateOrderBody,
  validateStatusUpdate,
  isNonEmptyString,
  isValidEmail,
  isValidPhone,
  isPositiveInteger,
  sanitizeString,
  sanitizePhone,
  stripTags,
};
