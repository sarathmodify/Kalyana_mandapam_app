"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Users,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";

interface SidebarProps {
    userRole?: string;
    userName?: string;
    mobileOpen?: boolean;
    onClose?: () => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

const NAV_ITEMS = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/ledger", label: "Ledger", icon: BookOpen },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
];

const ADMIN_ITEMS = [
    { href: "/dashboard/users", label: "Users", icon: Users },
];

export default function Sidebar({ userRole, userName, mobileOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    const handleLogout = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signOut({ scope: 'local' });
        } catch (err) {
            console.error("SignOut error:", err);
        } finally {
            router.push("/login");
            router.refresh();
        }
    };

    const handleLinkClick = () => {
        // Close mobile sidebar on navigation
        if (onClose) onClose();
    };

    const sidebarClasses = [
        styles.sidebar,
        collapsed ? styles.sidebarCollapsed : "",
        mobileOpen ? styles.sidebarMobileOpen : "",
    ].filter(Boolean).join(" ");

    return (
        <>
            {/* Mobile overlay backdrop */}
            {mobileOpen && (
                <div className={styles.overlay} onClick={onClose} />
            )}

            <aside className={sidebarClasses}>
                {/* Logo Area */}
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>🏛️</div>
                    {!collapsed && (
                        <div className={styles.logoText}>
                            <h2>Kalyana</h2>
                            <span>Mandapam</span>
                        </div>
                    )}
                </div>

                {/* Collapse Toggle (desktop only) */}
                <button
                    className={styles.toggle}
                    onClick={onToggleCollapse}
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                {/* Navigation */}
                <nav className={styles.nav}>
                    <div className={styles.navGroup}>
                        {!collapsed && <span className={styles.navLabel}>Main Menu</span>}
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles.link} ${active ? styles.linkActive : ""}`}
                                    title={collapsed ? item.label : undefined}
                                    onClick={handleLinkClick}
                                >
                                    <Icon size={20} />
                                    {!collapsed && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>

                    {userRole === "admin" && (
                        <div className={styles.navGroup}>
                            {!collapsed && <span className={styles.navLabel}>Admin</span>}
                            {ADMIN_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`${styles.link} ${active ? styles.linkActive : ""}`}
                                        title={collapsed ? item.label : undefined}
                                        onClick={handleLinkClick}
                                    >
                                        <Icon size={20} />
                                        {!collapsed && <span>{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </nav>

                {/* Bottom Section */}
                <div className={styles.bottom}>
                    {!collapsed && userName && (
                        <div className={styles.user}>
                            <div className={styles.userAvatar}>
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{userName}</span>
                                <span className={styles.userRole}>
                                    {userRole === "admin" ? "Admin" : "Viewer"}
                                </span>
                            </div>
                        </div>
                    )}
                    <button
                        className={`${styles.link} ${styles.logout}`}
                        onClick={handleLogout}
                        title={collapsed ? "Logout" : undefined}
                    >
                        <LogOut size={20} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
