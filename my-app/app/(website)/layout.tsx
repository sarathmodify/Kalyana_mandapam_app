import type { ReactNode } from "react";

/**
 * Public website layout — wraps all public-facing pages.
 * Will include Navbar + Footer in Phase 2.
 */
export default function WebsiteLayout({ children }: { children: ReactNode }) {
    return (
        <div className="km-page">
            {/* Navbar will be added in Phase 2 */}
            <main>{children}</main>
            {/* Footer will be added in Phase 2 */}
        </div>
    );
}
