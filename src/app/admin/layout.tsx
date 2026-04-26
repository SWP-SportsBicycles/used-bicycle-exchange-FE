"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  ClipboardList,
  ReceiptText,
  AlertOctagon,
  UserPlus,
  ChevronRight,
  Settings,
  Users,
} from "lucide-react";
import { Header } from "@/components/header";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/api/admin-api";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { language } = useLanguage();

  const listingsQuery = useQuery({
    queryKey: ["admin-listings-sidebar"],
    queryFn: adminApi.getListings,
    refetchInterval: 15000,
  });

  const pendingApprovalsCount = (listingsQuery.data ?? []).filter(
    (item) => item.status === "pending",
  ).length;

  const sidebarItems = [
    {
      href: "/admin",
      icon: LayoutDashboard,
      label: { vi: "Bảng Báo Cáo", en: "Dashboard" },
      exact: true,
    },
    {
      href: "/admin/approvals",
      icon: ClipboardList,
      label: { vi: "Duyệt Tin Đăng", en: "Listing Approval" },
      badge: pendingApprovalsCount,
      badgeTone: "alert",
    },
    {
      href: "/admin/order",
      icon: ReceiptText,
      label: { vi: "Kiểm Duyệt Đơn Hàng", en: "Order Review" },
    },
    {
      href: "/admin/disputes",
      icon: AlertOctagon,
      label: { vi: "Báo Cáo", en: "Reports" },
      badge: 2,
    },
    {
      href: "/admin/create/inspectors",
      icon: UserPlus,
      label: { vi: "Tạo Kiểm Định Viên", en: "Create Inspector" },
    },
    {
      href: "/admin/manage/account",
      icon: Users,
      label: { vi: "Quản lý tài khoản", en: "Account Management" },
    },
  ];

  return (
    <RoleGuard allow={["admin"]}>
      <div className="min-h-screen bg-background">
        <Header />

        <div className="flex">
          {/* Sidebar - Command Center */}
          <aside className="hidden lg:flex w-64 flex-col border-r border-border/60 bg-sidebar min-h-[calc(100vh-4rem)] sticky top-16">
            <div className="p-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shadow-athletic">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2
                    className="font-bold text-lg"
                    style={{ fontFamily: "var(--font-archivo)" }}
                  >
                    {language === "vi" ? "Trung Tâm" : "Command"}
                  </h2>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4">
              <ul className="space-y-1">
                {sidebarItems.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-athletic"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label[language]}
                        {item.badge ? (
                          <Badge
                            variant={
                              item.badgeTone === "alert"
                                ? "destructive"
                                : isActive
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="ml-auto h-5 px-1.5 text-xs"
                          >
                            {item.badge}
                          </Badge>
                        ) : null}
                        {isActive && !item.badge ? (
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center gap-2 p-4 border-b border-border/60 overflow-x-auto bg-card">
              {sidebarItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label[language]}
                    {item.badge ? (
                      <Badge
                        variant={
                          item.badgeTone === "alert"
                            ? "destructive"
                            : "destructive"
                        }
                        className="h-5 px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Link>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 lg:p-6"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
