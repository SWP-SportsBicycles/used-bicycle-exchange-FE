import type { User, UserRole } from "@/types/domain";

export function userHasRole(user: User | null, role: UserRole) {
  if (role === "guest") return user === null;
  return !!user?.roles.includes(role);
}

