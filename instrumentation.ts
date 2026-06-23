// Node.js 22+ exposes `localStorage` as a global, but without a valid
// --localstorage-file configured (Next.js 15 passes the flag without a path),
// the methods like getItem/setItem are undefined — causing a TypeError during SSR.
// This hook runs once at server startup and replaces the broken global with a
// safe no-op shim so SSR never crashes on bare `localStorage` calls.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const ls = (globalThis as Record<string, unknown>).localStorage as
      | Storage
      | undefined;

    if (ls !== undefined && typeof ls.getItem !== "function") {
      Object.defineProperty(globalThis, "localStorage", {
        writable: true,
        configurable: true,
        value: {
          getItem: (_key: string): null => null,
          setItem: (_key: string, _value: string): void => {},
          removeItem: (_key: string): void => {},
          clear: (): void => {},
          get length(): number {
            return 0;
          },
          key: (_index: number): null => null,
        } satisfies Storage,
      });
    }
  }
}
