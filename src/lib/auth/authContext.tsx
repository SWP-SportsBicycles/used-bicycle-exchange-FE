"use client";

import * as React from "react";

import type { Id, User, UserRole } from "@/types/domain";
import { mockUsers } from "@/mocks/mockData";

export type AuthState = {
  user: User | null;
  activeRole: UserRole;
  depositConfirmedOrderIds: Set<Id>;
};

type AuthContextValue = AuthState & {
  signInAsRole: (role: Exclude<UserRole, "guest">) => void;
  signOut: () => void;
  setDepositConfirmed: (orderId: Id, confirmed: boolean) => void;
  hasRole: (role: UserRole) => boolean;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

function pickUserForRole(role: Exclude<UserRole, "guest">): User {
  const found = mockUsers.find((u) => u.roles.includes(role));
  if (!found) {
    return {
      id: `user_${role}`,
      email: `${role}@example.com`,
      displayName: role.toUpperCase(),
      roles: [role],
    };
  }
  return found;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(() => ({
    user: null,
    activeRole: "guest",
    depositConfirmedOrderIds: new Set<Id>(),
  }));

  const value = React.useMemo<AuthContextValue>(
    () => ({
      ...state,
      signInAsRole: (role) => {
        setState((s) => ({ ...s, user: pickUserForRole(role), activeRole: role }));
      },
      signOut: () => setState((s) => ({ ...s, user: null, activeRole: "guest" })),
      setDepositConfirmed: (orderId, confirmed) => {
        setState((s) => {
          const next = new Set(s.depositConfirmedOrderIds);
          if (confirmed) next.add(orderId);
          else next.delete(orderId);
          return { ...s, depositConfirmedOrderIds: next };
        });
      },
      hasRole: (role) =>
        role === "guest" ? state.user === null : !!state.user?.roles.includes(role),
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

