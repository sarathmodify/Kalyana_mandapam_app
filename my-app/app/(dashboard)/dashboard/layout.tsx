import type { ReactNode } from "react";

/**
 * Dashboard layout — wraps all protected pages.
 * Will include Sidebar + TopNavbar in Phase 3.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="km-page">
            {/* Sidebar will be added in Phase 3 */}
            {/* TopNavbar will be added in Phase 3 */}
            <main>{children}</main>
        </div>
    );
}
