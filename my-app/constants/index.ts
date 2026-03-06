// ═══════════════════════════════════════════════════════════════
// KALYANA MANDAPAM — App Constants
// ═══════════════════════════════════════════════════════════════

// ── User Roles ──────────────────────────────────────────────────
export const USER_ROLES = {
    ADMIN: "admin",
    VIEWER: "viewer",
} as const;

// ── Ledger Categories ───────────────────────────────────────────
export const LEDGER_CATEGORIES = [
    "Hall Booking",
    "Catering",
    "Decoration",
    "Cleaning & Maintenance",
    "Utilities",
    "Staff Salary",
    "Advance Payment",
    "Refund",
    "Other",
];

// ── Payment Methods ─────────────────────────────────────────────
export const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "upi", label: "UPI" },
    { value: "cheque", label: "Cheque" },
    { value: "other", label: "Other" },
];

// ── Event Types ─────────────────────────────────────────────────
export const EVENT_TYPES = [
    "Wedding",
    "Reception",
    "Engagement",
    "Birthday",
    "Corporate",
    "Other",
];

// ── Booking Statuses ────────────────────────────────────────────
export const BOOKING_STATUSES = [
    { value: "confirmed", label: "Confirmed", color: "success" },
    { value: "tentative", label: "Tentative", color: "warning" },
    { value: "cancelled", label: "Cancelled", color: "error" },
];

// ── Public Navigation Links ─────────────────────────────────────
export const PUBLIC_NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/facilities", label: "Facilities" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
];

// ── Dashboard Sidebar Links ─────────────────────────────────────
export const DASHBOARD_NAV_LINKS = [
    { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
    { href: "/dashboard/ledger", label: "Ledger", icon: "BookOpen" },
    { href: "/dashboard/bookings", label: "Bookings", icon: "Calendar" },
    { href: "/dashboard/reports", label: "Reports", icon: "BarChart3" },
    { href: "/dashboard/inquiries", label: "Inquiries", icon: "MessageSquare" },
];

// Admin-only link
export const ADMIN_NAV_LINKS = [
    { href: "/dashboard/users", label: "Users", icon: "Users" },
];

// ── Hall Details ────────────────────────────────────────────────
export const HALL_INFO = {
    name: "Kalyana Mandapam",
    tagline: "Where Dreams Meet Tradition",
    phone: "+91 98765 43210",
    email: "info@kalyanamandapam.com",
    address: "123 Temple Street, Coimbatore, Tamil Nadu 641001",
    capacity: 1000,
    foundedYear: 1995,
};
