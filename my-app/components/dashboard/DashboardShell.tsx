"use client";

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
    return (
        <div className={styles.shell}>
            <Sidebar userRole={userRole} userName={userName} />
            <div className={styles.main}>
                <TopNavbar userName={userName} userRole={userRole} />
                <main className={styles.content}>{children}</main>
            </div>
        </div>
    );
}
