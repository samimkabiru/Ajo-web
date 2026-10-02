import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatPhoneWithDashes, isPayoutDateReached, formatDisplayDate } from "./utils";

describe("formatPhoneWithDashes", () => {
  it("formats standard 11-digit local phone number with dashes between each 3 digits", () => {
    assert.equal(formatPhoneWithDashes("08012345678"), "080-123-456-78");
    assert.equal(formatPhoneWithDashes("09098765432"), "090-987-654-32");
  });

  it("formats international number with leading plus and dashes between each 3 digits", () => {
    assert.equal(formatPhoneWithDashes("+2348012345678"), "+234-801-234-567-8");
    assert.equal(formatPhoneWithDashes("+2348031234567"), "+234-803-123-456-7");
  });

  it("handles numbers with existing spaces or irregular formatting", () => {
    assert.equal(formatPhoneWithDashes("+234 801 234 5678"), "+234-801-234-567-8");
    assert.equal(formatPhoneWithDashes("080-123-45678"), "080-123-456-78");
  });

  it("handles empty or falsy values gracefully", () => {
    assert.equal(formatPhoneWithDashes(""), "");
    assert.equal(formatPhoneWithDashes(null), "");
    assert.equal(formatPhoneWithDashes(undefined), "");
    assert.equal(formatPhoneWithDashes("   "), "");
  });
});

describe("isPayoutDateReached", () => {
  const mockNow = new Date(2026, 9, 15, 14, 30, 0); // Oct 15, 2026 at 2:30 PM

  it("returns true when target date is in the past", () => {
    assert.equal(isPayoutDateReached("2026-10-10", mockNow), true);
    assert.equal(isPayoutDateReached("2026-10-14", mockNow), true);
  });

  it("returns true on the exact day of the payout (even at start of day)", () => {
    assert.equal(isPayoutDateReached("2026-10-15", mockNow), true);
  });

  it("returns false when target date is in the future", () => {
    assert.equal(isPayoutDateReached("2026-10-16", mockNow), false);
    assert.equal(isPayoutDateReached("2026-10-25", mockNow), false);
  });

  it("handles ISO strings properly", () => {
    assert.equal(isPayoutDateReached("2026-10-14T23:59:59Z", mockNow), true);
    assert.equal(isPayoutDateReached("2026-10-16T00:00:00Z", mockNow), false);
  });

  it("returns true gracefully when target date is missing or invalid", () => {
    assert.equal(isPayoutDateReached(null, mockNow), true);
    assert.equal(isPayoutDateReached("", mockNow), true);
    assert.equal(isPayoutDateReached("invalid-date", mockNow), true);
  });
});

describe("formatDisplayDate", () => {
  it("formats YYYY-MM-DD cleanly to readable US date format", () => {
    assert.equal(formatDisplayDate("2026-10-15"), "Oct 15, 2026");
    assert.equal(formatDisplayDate("2026-01-05"), "Jan 5, 2026");
  });

  it("handles empty or missing date strings", () => {
    assert.equal(formatDisplayDate(null), "—");
    assert.equal(formatDisplayDate(""), "—");
  });
});
