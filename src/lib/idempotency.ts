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
 * Hook to manage idempotency keys per operation.
 * SPECIFICATION RULES:
 * 1. Key is initialized when intent is formed (e.g. when modal/sheet opens).
 * 2. Network timeouts or retries of the SAME in-flight operation send the same key.
 * 3. After every SUCCESSFUL submission, rotateKey() MUST be called so that any subsequent
 *    operation performed in the same modal session (e.g. consecutive partial repayments,
 *    admin recording cash for multiple members) receives a fresh unique key.
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

  const rotateKey = useCallback(() => {
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
    rotateKey,
    resetIntent,
  };
}
