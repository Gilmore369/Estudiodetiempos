/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Google Sheets URL
 */
export function isValidGoogleSheetsUrl(url: string): boolean {
  const sheetsRegex = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  return sheetsRegex.test(url);
}

/**
 * Extract spreadsheet ID from Google Sheets URL
 */
export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Validate time value (must be positive number)
 */
export function isValidTime(time: number): boolean {
  return typeof time === 'number' && time > 0 && isFinite(time);
}

/**
 * Validate percentage value (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 100;
}

/**
 * Validate Westinghouse factor (-1 to 1)
 */
export function isValidWestinghouseFactor(factor: number): boolean {
  return typeof factor === 'number' && factor >= -1 && factor <= 1;
}

/**
 * Validate required string field
 */
export function isValidRequiredString(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate study element name
 */
export function isValidElementName(name: string): boolean {
  return isValidRequiredString(name) && name.length <= 100;
}

/**
 * Check if tolerance values are within recommended limits
 */
export function isToleranceWithinLimits(tolerance: number): boolean {
  return tolerance <= 50; // Warning if total tolerance exceeds 50%
}