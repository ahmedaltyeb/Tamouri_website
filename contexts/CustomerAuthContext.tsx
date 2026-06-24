"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

interface CustomerAuthContextValue {
  user: CustomerUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/account/profile", { credentials: "include" });
      if (res.ok) setUser(await res.json());
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/customer/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <CustomerAuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}
