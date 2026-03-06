"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import styles from "./TopNavbar.module.css";

interface TopNavbarProps {
    userName?: string;
    userRole?: string;
}

const PAGE_TITLES: Record<string, string> = {
    "/dashboard": "Dashboard Overview",
    "/dashboard/ledger": "Ledger",
    "/dashboard/ledger/add": "Add Ledger Entry",
    "/dashboard/bookings": "Bookings",
    "/dashboard/bookings/add": "Add Booking",
    "/dashboard/reports": "Reports",
    "/dashboard/users": "User Management",
    "/dashboard/inquiries": "Inquiries",
};

export default function TopNavbar({ userName, userRole }: TopNavbarProps) {
    const pathname = usePathname();

    const getTitle = () => {
        if (pathname.includes("/ledger/edit/")) return "Edit Ledger Entry";
        return PAGE_TITLES[pathname] || "Dashboard";
    };

    return (
        <header className={styles.topnav}>
            <div>
                <h1 className={styles.title}>{getTitle()}</h1>
            </div>

            <div className={styles.right}>
                <div className={styles.search}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className={styles.searchInput}
                    />
                </div>

                <button className={styles.notification} title="Notifications">
                    <Bell size={20} />
                    <span className={styles.notificationDot}></span>
                </button>

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
