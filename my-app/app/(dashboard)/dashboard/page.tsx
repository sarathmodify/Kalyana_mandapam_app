import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    FileText,
} from "lucide-react";

export default async function DashboardPage() {
    const supabase = await createClient();

    // Fetch all ledger data in parallel
    const [
        { data: ledgerEntries },
        { data: recentLedger },
    ] = await Promise.all([
        supabase
            .from("ledger_entries")
            .select("amount, type"),
        supabase
            .from("ledger_entries")
            .select("*")
            .order("date", { ascending: false })
            .limit(10),
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
    const totalEntries = ledgerEntries?.length || 0;

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
            label: "Total Entries",
            value: totalEntries.toString(),
            icon: FileText,
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

            {/* Recent Ledger Entries */}
            <div className="recent-section">
                <div className="recent-card">
                    <div className="recent-header">
                        <h3>Recent Ledger Entries</h3>
                        <a href="/dashboard/ledger" className="recent-link">
                            View all →
                        </a>
                    </div>
                    {recentLedger && recentLedger.length > 0 ? (
                        <div className="recent-table-scroll">
                            <table className="km-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Category</th>
                                        <th>Amount</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLedger.map((entry) => (
                                        <tr key={entry.id}>
                                            <td style={{ whiteSpace: "nowrap" }}>{formatDate(entry.date)}</td>
                                            <td>{entry.description}</td>
                                            <td>{entry.category || "—"}</td>
                                            <td style={{ whiteSpace: "nowrap" }}>{formatCurrency(Number(entry.amount))}</td>
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
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No ledger entries yet</p>
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
                    grid-template-columns: repeat(3, 1fr);
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
                    min-width: 0;
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
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .recent-section {
                    display: grid;
                    grid-template-columns: 1fr;
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
                    gap: var(--space-3);
                    flex-wrap: wrap;
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
                    white-space: nowrap;
                }
                .recent-link:hover {
                    color: var(--color-primary-light);
                }
                .recent-table-scroll {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
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
                }
                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: var(--space-3);
                    }
                    .stat-card {
                        padding: var(--space-4);
                        gap: var(--space-3);
                    }
                    .stat-icon-wrap {
                        width: 40px;
                        height: 40px;
                    }
                    .stat-value {
                        font-size: var(--text-lg);
                    }
                }
                @media (max-width: 480px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: var(--space-3);
                        margin-bottom: var(--space-5);
                    }
                    .stat-value {
                        font-size: var(--text-base);
                    }
                }
            `}</style>
        </div >
    );
}
