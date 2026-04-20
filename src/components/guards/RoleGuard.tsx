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
  const { user } = useAuth();

  useEffect(() => {
    if (!allow.includes(user.role)) {
      router.replace("/");
    }
  }, [allow, router, user.role]);

  if (!allow.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
