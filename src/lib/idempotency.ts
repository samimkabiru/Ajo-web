"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Generates a standard RFC 4122 v4 UUID
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Hook to manage idempotency keys per user intent.
 * SPECIFICATION RULE:
 * Generate the key when the user forms the intent (e.g. when sheet/modal opens), NOT when they click.
 * Every attempt at that action (retry, network timeout, double tap) sends the same key.
 */
export function useIdempotencyKey(initialOpen: boolean = false) {
  const [key, setKey] = useState<string>(() => (initialOpen ? generateUUID() : ""));
  const keyRef = useRef<string>(key);

  const initIntent = useCallback(() => {
    const newKey = generateUUID();
    keyRef.current = newKey;
    setKey(newKey);
    return newKey;
  }, []);

  const resetIntent = useCallback(() => {
    keyRef.current = "";
    setKey("");
  }, []);

  return {
    key,
    keyRef,
    initIntent,
    resetIntent,
  };
}
