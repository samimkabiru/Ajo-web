import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatPhoneWithDashes } from "./utils";

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
