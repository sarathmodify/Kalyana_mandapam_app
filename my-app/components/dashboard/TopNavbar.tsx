"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import styles from "./TopNavbar.module.css";

interface TopNavbarProps {
    userName?: string;
    userRole?: string;
    onMenuClick?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
    "/dashboard": "Dashboard Overview",
    "/dashboard/ledger": "Ledger",
    "/dashboard/ledger/add": "Add Ledger Entry",
    "/dashboard/reports": "Reports",
    "/dashboard/users": "User Management",
};

export default function TopNavbar({ userName, userRole, onMenuClick }: TopNavbarProps) {
    const pathname = usePathname();

    const getTitle = () => {
        if (pathname.includes("/ledger/edit/")) return "Edit Ledger Entry";
        return PAGE_TITLES[pathname] || "Dashboard";
    };

    return (
        <header className={styles.topnav}>
            <div className={styles.left}>
                <button
                    className={styles.menuBtn}
                    onClick={onMenuClick}
                    title="Open menu"
                    aria-label="Open navigation menu"
                >
                    <Menu size={22} />
                </button>
                <h1 className={styles.title}>{getTitle()}</h1>
            </div>

            <div className={styles.right}>
                <div className={styles.user}>
                    <div className={styles.userAvatar}>
                        {userName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{userName || "User"}</span>
                        <span className={styles.userRole}>
                            {userRole === "admin" ? "Admin" : "Viewer"}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
