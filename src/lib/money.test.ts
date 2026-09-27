import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseNairaToKobo,
  formatKobo,
  formatSignedKobo,
  formatPoolBalance,
} from "./money";

describe("money utilities", () => {
  describe("parseNairaToKobo", () => {
    it("parses standard integer naira strings correctly", () => {
      assert.equal(parseNairaToKobo("10000"), 1000000);
      assert.equal(parseNairaToKobo("20,000"), 2000000);
      assert.equal(parseNairaToKobo("₦50,000"), 5000000);
      assert.equal(parseNairaToKobo("1,000,000"), 100000000);
    });

    it("parses decimal values accurately without floating-point errors", () => {
      assert.equal(parseNairaToKobo("10000.50"), 1000050);
      assert.equal(parseNairaToKobo("10,000.5"), 1000050);
      assert.equal(parseNairaToKobo("0.05"), 5);
      assert.equal(parseNairaToKobo("0.50"), 50);
      assert.equal(parseNairaToKobo("1234.99"), 123499);
      // Truncates past 2 decimal digits safely
      assert.equal(parseNairaToKobo("10.559"), 1055);
    });

    it("handles empty and edge case inputs gracefully", () => {
      assert.equal(parseNairaToKobo(""), 0);
      assert.equal(parseNairaToKobo("invalid"), 0);
      assert.equal(parseNairaToKobo(0), 0);
    });
  });

  describe("formatKobo", () => {
    it("formats whole naira values without trailing zero kobo", () => {
      assert.equal(formatKobo(1000000), "₦10,000");
      assert.equal(formatKobo(200000), "₦2,000");
      assert.equal(formatKobo(0), "₦0");
      assert.equal(formatKobo(100000000), "₦1,000,000");
    });

    it("formats kobo amounts when non-zero", () => {
      assert.equal(formatKobo(1000050), "₦10,000.50");
      assert.equal(formatKobo(1000005), "₦10,000.05");
      assert.equal(formatKobo(75), "₦0.75");
    });
  });

  describe("formatSignedKobo", () => {
    it("never includes a minus sign in the output text", () => {
      const negativeResult = formatSignedKobo(-2000000);
      assert.ok(!negativeResult.text.includes("-"));
      assert.equal(negativeResult.text, "The group owes you ₦20,000");
      assert.equal(negativeResult.status, "owed");
      assert.equal(negativeResult.amountFormatted, "₦20,000");

      const positiveResult = formatSignedKobo(2000000);
      assert.ok(!positiveResult.text.includes("-"));
      assert.equal(positiveResult.text, "You owe the group ₦20,000");
      assert.equal(positiveResult.status, "owes");
      assert.equal(positiveResult.amountFormatted, "₦20,000");

      const zeroResult = formatSignedKobo(0);
      assert.equal(zeroResult.text, "All square");
      assert.equal(zeroResult.status, "square");
    });

    it("supports third-person member descriptions", () => {
      const result = formatSignedKobo(-1500000, {
        subject: "member",
        memberName: "Chioma",
      });
      assert.equal(result.text, "The group owes Chioma ₦15,000");
    });
  });

  describe("formatPoolBalance", () => {
    it("displays negative ledger liability as a positive pot amount", () => {
      assert.equal(formatPoolBalance(-3000000), "₦30,000 in the pot");
      assert.equal(formatPoolBalance(3000000), "₦30,000 in the pot");
      assert.equal(formatPoolBalance(0), "₦0 in the pot");
    });
  });
});
