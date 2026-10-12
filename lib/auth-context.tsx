"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiSend, setAuthToken, getAuthToken } from "@/lib/api";
import { Account, LoginDTO, LoginResponse, RegisterDTO } from "@/lib/types";

interface AuthContextValue {
  account: Account | null;
  loading: boolean;
  login: (dto: LoginDTO) => Promise<void>;
  register: (dto: RegisterDTO) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setAccount({
        accountID: Number(payload.AccountID),
        fullName: payload.FullName ?? payload.fullName ?? "",
        email: payload.Email ?? payload.email ?? "",
        role: Number(payload.Role ?? payload.role ?? 0),
        createdDate: payload.CreatedDate ?? payload.createdDate ?? "",
      });
    } catch {
      setAuthToken(null);
    }
    setLoading(false);
  }, []);

  const login = async (dto: LoginDTO) => {
    const res = await apiSend<LoginResponse>("/auth/login", "POST", dto);
    setAuthToken(res.token);
    setAccount(res.account);
  };

  const register = async (dto: RegisterDTO) => {
    const res = await apiSend<LoginResponse>("/auth/register", "POST", dto);
    setAuthToken(res.token);
    setAccount(res.account);
  };

  const logout = () => {
    setAuthToken(null);
    setAccount(null);
  };

  return (
    <AuthContext.Provider value={{ account, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
