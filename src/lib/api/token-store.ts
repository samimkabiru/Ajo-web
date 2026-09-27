/**
 * In-memory access token store.
 * SPECIFICATION RULE:
 * The access token is short-lived (15 minutes). Hold it in memory.
 * NOT localStorage, NOT sessionStorage.
 * Dies with the tab, preventing token theft through injected scripts.
 */

type TokenListener = (token: string | null) => void;

class TokenStore {
  private accessToken: string | null = null;
  private listeners: Set<TokenListener> = new Set();

  getToken(): string | null {
    return this.accessToken;
  }

  setToken(token: string | null): void {
    this.accessToken = token;
    for (const listener of this.listeners) {
      try {
        listener(token);
      } catch (e) {
        console.error("Error in token listener:", e);
      }
    }
  }

  clearToken(): void {
    this.setToken(null);
  }

  subscribe(listener: TokenListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const tokenStore = new TokenStore();
