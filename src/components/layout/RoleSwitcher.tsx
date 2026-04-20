"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/authContext";
import { useI18n } from "@/lib/i18n/i18nContext";
import type { UserRole } from "@/types/domain";

const ROLES: Exclude<UserRole, "guest">[] = [
  "buyer",
  "seller",
  "inspector",
  "admin",
];

export function RoleSwitcher() {
  const { activeRole, signInAsRole, signOut } = useAuth();
  const { messages } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {messages.common.signInAs}: {activeRole}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Auth</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((r) => (
          <DropdownMenuItem key={r} onSelect={() => signInAsRole(r)}>
            Sign in as {r}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut()}>
          {messages.common.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

