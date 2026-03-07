import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    CalendarCheck,
} from "lucide-react";

export default async function DashboardPage() {
    const supabase = await createClient();

    // Fetch all data in parallel (4x faster than sequential)
    const [
        { data: ledgerEntries },
        { data: upcomingBookings },
        { data: recentLedger },
        { data: recentBookings },
    ] = await Promise.all([
        supabase
            .from("ledger_entries")
            .select("amount, type"),
        supabase
            .from("bookings")
            .select("*")
            .eq("status", "confirmed")
            .gte("event_date", new Date().toISOString().split("T")[0])
            .order("event_date", { ascending: true }),
        supabase
            .from("ledger_entries")
            .select("*")
            .order("date", { ascending: false })
            .limit(5),
        supabase
            .from("bookings")
            .select("*")
            .order("event_date", { ascending: true })
            .limit(5),
    ]);

    // Calculate totals
    const totalIncome =
        ledgerEntries
            ?.filter((e) => e.type === "income")
            .reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    const totalExpenses =
        ledgerEntries
            ?.filter((e) => e.type === "expense")
            .reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    const netBalance = totalIncome - totalExpenses;
    const upcomingCount = upcomingBookings?.length || 0;

    const stats = [
        {
            label: "Total Income",
            value: formatCurrency(totalIncome),
            icon: TrendingUp,
            color: "#16A34A",
            bg: "#F0FDF4",
        },
        {
            label: "Total Expenses",
            value: formatCurrency(totalExpenses),
            icon: TrendingDown,
            color: "#EF4444",
            bg: "#FEF2F2",
        },
        {
            label: "Net Balance",
            value: formatCurrency(netBalance),
            icon: Wallet,
            color: "#1E40AF",
            bg: "#EFF6FF",
        },
        {
            label: "Upcoming Bookings",
            value: upcomingCount.toString(),
            icon: CalendarCheck,
            color: "#9333EA",
            bg: "#FAF5FF",
        },
    ];

    return (
        <div className="dashboard-overview">
            {/* Stat Cards */}
            <div className="stats-grid">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="stat-card">
                            <div
                                className="stat-icon-wrap"
                                style={{ background: stat.bg }}
                            >
                                <Icon size={22} color={stat.color} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">{stat.label}</span>
                                <span
                                    className="stat-value"
                                    style={{ color: stat.color }}
                                >
                                    {stat.value}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Data Section */}
            <div className="recent-grid">
                {/* Recent Ledger Entries */}
                <div className="recent-card">
                    <div className="recent-header">
                        <h3>Recent Ledger Entries</h3>
                        <a href="/dashboard/ledger" className="recent-link">
                            View all →
                        </a>
                    </div>
                    {recentLedger && recentLedger.length > 0 ? (
                        <table className="km-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLedger.map((entry) => (
                                    <tr key={entry.id}>
                                        <td>{formatDate(entry.date)}</td>
                                        <td>{entry.description}</td>
                                        <td>{formatCurrency(Number(entry.amount))}</td>
                                        <td>
                                            <span
                                                className={`km-badge ${entry.type === "income" ? "km-badge-success" : "km-badge-error"}`}
                                            >
                                                {entry.type}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <p>No ledger entries yet</p>
                        </div>
                    )}
                </div>

                {/* Recent Bookings */}
                <div className="recent-card">
                    <div className="recent-header">
                        <h3>Upcoming Bookings</h3>
                        <a href="/dashboard/bookings" className="recent-link">
                            View all →
                        </a>
                    </div>
                    {recentBookings && recentBookings.length > 0 ? (
                        <table className="km-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Event</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>{formatDate(booking.event_date)}</td>
                                        <td>{booking.customer_name}</td>
                                        <td>{booking.event_type || "—"}</td>
                                        <td>
                                            <span
                                                className={`km-badge ${booking.status === "confirmed"
                                                    ? "km-badge-success"
                                                    : booking.status === "tentative"
                                                        ? "km-badge-warning"
                                                        : "km-badge-error"
                                                    }`}
                                            >
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <p>No bookings yet</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .dashboard-overview {
                    animation: fadeIn 0.3s ease;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--space-5);
                    margin-bottom: var(--space-8);
                }
                .stat-card {
                    background: var(--color-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-xl);
                    padding: var(--space-5);
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                    box-shadow: var(--shadow-card);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                }
                .stat-icon-wrap {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .stat-info {
                    display: flex;
                    flex-direction: column;
                }
                .stat-label {
                    font-size: var(--text-xs);
                    color: var(--color-text-muted);
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .stat-value {
                    font-family: var(--font-heading);
                    font-size: var(--text-xl);
                    font-weight: 700;
                    line-height: 1.2;
                }
                .recent-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--space-5);
                }
                .recent-card {
                    background: var(--color-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-card);
                    overflow: hidden;
                }
                .recent-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--space-5) var(--space-5) var(--space-3);
                }
                .recent-header h3 {
                    font-family: var(--font-heading);
                    font-size: var(--text-base);
                    font-weight: 600;
                    color: var(--color-text-primary);
                }
                .recent-link {
                    font-size: var(--text-sm);
                    color: var(--color-primary);
                    font-weight: 500;
                    text-decoration: none;
                }
                .recent-link:hover {
                    color: var(--color-primary-light);
                }
                .empty-state {
                    padding: var(--space-10);
                    text-align: center;
                }
                .empty-state p {
                    color: var(--color-text-muted);
                    font-size: var(--text-sm);
                }
                @media (max-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .recent-grid {
                        grid-template-columns: 1fr;
                    }
                }
                @media (max-width: 640px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
