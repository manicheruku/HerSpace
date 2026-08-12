/**
 * The backend serializes naive UTC datetimes without a timezone designator
 * (e.g. "2026-07-01T10:00:00.123456"). JavaScript's `Date` parses such strings
 * as *local* time, which shifts every timestamp by the viewer's UTC offset.
 *
 * `normalizeServerDate` appends a `Z` when no timezone information is present so
 * the value is interpreted as UTC. Strings that already carry an offset (`Z` or
 * `±HH:MM`) are returned untouched.
 */
export function normalizeServerDate(value: string): string;
export function normalizeServerDate(value: string | null): string | null;
export function normalizeServerDate(value: string | null): string | null {
  if (!value) return value;
  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  return hasTimezone ? value : `${value}Z`;
}
