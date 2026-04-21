"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/lib/auth-context";

interface RoleGuardProps {
  allow: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allow, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (!allow.includes(user.role)) {
      router.replace("/");
    }
  }, [allow, isInitializing, router, user.role]);

  if (isInitializing) {
    return null;
  }

  if (!allow.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
