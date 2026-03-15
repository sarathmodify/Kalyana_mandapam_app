"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import styles from "./DashboardShell.module.css";

interface DashboardShellProps {
    children: React.ReactNode;
    userRole?: string;
    userName?: string;
}

export default function DashboardShell({
    children,
    userRole,
    userName,
}: DashboardShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className={styles.shell}>
            <Sidebar
                userRole={userRole}
                userName={userName}
                mobileOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />
            <div className={styles.main}>
                <TopNavbar
                    userName={userName}
                    userRole={userRole}
                    onMenuClick={() => setMobileOpen(true)}
                />
                <main className={styles.content}>{children}</main>
            </div>
        </div>
    );
}
