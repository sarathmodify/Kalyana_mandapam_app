"use client";

import { useState } from "react";
import { formatCurrency, exportToCSV } from "@/lib/utils";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    BarChart3,
    Download,
    Calendar,
} from "lucide-react";
import styles from "./reports.module.css";

interface LedgerEntry {
    id: string;
    date: string;
    amount: number;
    type: "income" | "expense";
    category?: string;
    description: string;
    payment_method?: string;
}

interface MonthlyRow {
    month: string;
    income: number;
    expense: number;
    net: number;
}

interface CategoryRow {
    category: string;
    total: number;
    count: number;
    percent: number;
}

interface ReportsClientProps {
    initialEntries: LedgerEntry[];
    isAdmin: boolean;
}

function getMonthLabel(dateStr: string) {
    return new Date(dateStr + "-01").toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
    });
}

export default function ReportsClient({ initialEntries, isAdmin }: ReportsClientProps) {
    const [entries] = useState<LedgerEntry[]>(initialEntries);

    // ── Summary Stats ──────────────────────────────────────────────
    const totalIncome = entries.filter((e) => e.type === "income").reduce((s, e) => s + Number(e.amount), 0);
    const totalExpense = entries.filter((e) => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0);
    const netBalance = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : "0.0";

    // ── Monthly Breakdown ──────────────────────────────────────────
    const monthlyMap: Record<string, MonthlyRow> = {};
    entries.forEach((e) => {
        const key = e.date.slice(0, 7); // "YYYY-MM"
        if (!monthlyMap[key]) monthlyMap[key] = { month: key, income: 0, expense: 0, net: 0 };
        if (e.type === "income") monthlyMap[key].income += Number(e.amount);
        else monthlyMap[key].expense += Number(e.amount);
        monthlyMap[key].net = monthlyMap[key].income - monthlyMap[key].expense;
    });
    const monthlyRows = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    // ── Category Breakdown ─────────────────────────────────────────
    const categoryMap: Record<string, { total: number; count: number }> = {};
    entries.forEach((e) => {
        const cat = e.category || "Uncategorised";
        if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 };
        categoryMap[cat].total += Number(e.amount);
        categoryMap[cat].count += 1;
    });
    const totalAll = Object.values(categoryMap).reduce((s, c) => s + c.total, 0);
    const categoryRows: CategoryRow[] = Object.entries(categoryMap)
        .map(([cat, data]) => ({
            category: cat,
            total: data.total,
            count: data.count,
            percent: totalAll > 0 ? (data.total / totalAll) * 100 : 0,
        }))
        .sort((a, b) => b.total - a.total);

    // ── Chart helpers ──────────────────────────────────────────────
    const chartMax = Math.max(...monthlyRows.map((r) => Math.max(r.income, r.expense)), 1);
    const barHeight = 160;

    // ── CSV Export ─────────────────────────────────────────────────
    const handleExport = () => {
        const data = monthlyRows.map((r) => ({
            Month: getMonthLabel(r.month + "-01"),
            "Total Income": r.income,
            "Total Expenses": r.expense,
            "Net Balance": r.net,
        }));
        exportToCSV(data, `km-report-${new Date().toISOString().split("T")[0]}`);
    };

    // ── Bar chart colors ───────────────────────────────────────────
    const CAT_COLORS = [
        "#1E40AF", "#16A34A", "#D97706", "#7C3AED", "#DB2777",
        "#0891B2", "#65A30D", "#EA580C", "#6366F1", "#71717A",
    ];

    return (
        <div className={styles.page}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>Reports</h2>
                    <p>Financial performance overview and analytics</p>
                </div>
                <div className={styles.headerActions}>
                    {/* TODO: Export CSV — hidden for now
                    {isAdmin && (
                        <button className="km-btn-outline" onClick={handleExport}>
                            <Download size={16} /> Export CSV
                        </button>
                    )}
                    */}
                </div>
            </div>

            {/* ── Summary Stat Cards ── */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.statCardGreen}`}>
                    <div className={styles.statIcon} style={{ background: "#F0FDF4" }}>
                        <TrendingUp size={22} color="#16A34A" />
                    </div>
                    <div>
                        <div className={styles.statLabel}>Total Income</div>
                        <div className={styles.statValue} style={{ color: "#16A34A" }}>
                            {formatCurrency(totalIncome)}
                        </div>
                        <div className={styles.statSub}>{entries.filter((e) => e.type === "income").length} transactions</div>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.statCardRed}`}>
                    <div className={styles.statIcon} style={{ background: "#FEF2F2" }}>
                        <TrendingDown size={22} color="#EF4444" />
                    </div>
                    <div>
                        <div className={styles.statLabel}>Total Expenses</div>
                        <div className={styles.statValue} style={{ color: "#EF4444" }}>
                            {formatCurrency(totalExpense)}
                        </div>
                        <div className={styles.statSub}>{entries.filter((e) => e.type === "expense").length} transactions</div>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.statCardBlue}`}>
                    <div className={styles.statIcon} style={{ background: "#EFF6FF" }}>
                        <Wallet size={22} color="#1E40AF" />
                    </div>
                    <div>
                        <div className={styles.statLabel}>Net Balance</div>
                        <div className={styles.statValue} style={{ color: netBalance >= 0 ? "#1E40AF" : "#EF4444" }}>
                            {formatCurrency(netBalance)}
                        </div>
                        <div className={styles.statSub}>{netBalance >= 0 ? "Surplus" : "Deficit"}</div>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.statCardGold}`}>
                    <div className={styles.statIcon} style={{ background: "#FEF9E7" }}>
                        <BarChart3 size={22} color="#B8940F" />
                    </div>
                    <div>
                        <div className={styles.statLabel}>Profit Margin</div>
                        <div className={styles.statValue} style={{ color: "#B8940F" }}>
                            {profitMargin}%
                        </div>
                        <div className={styles.statSub}>of income retained</div>
                    </div>
                </div>
            </div>

            <div className={styles.chartsRow}>
                {/* ── Bar Chart — Income vs Expense ── */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3>Income vs Expenses</h3>
                        <div className={styles.chartLegend}>
                            <span className={styles.legendDot} style={{ background: "#16A34A" }} /> Income
                            <span className={styles.legendDot} style={{ background: "#EF4444", marginLeft: 12 }} /> Expenses
                        </div>
                    </div>

                    {monthlyRows.length === 0 ? (
                        <div className={styles.emptyChart}>
                            <Calendar size={36} color="var(--color-text-muted)" />
                            <p>No entries for this period</p>
                        </div>
                    ) : (
                        <div className={styles.barChart}>
                            {monthlyRows.map((row) => (
                                <div key={row.month} className={styles.barGroup}>
                                    <div className={styles.barsWrap} style={{ height: barHeight }}>
                                        <div
                                            className={styles.barIncome}
                                            style={{ height: `${(row.income / chartMax) * barHeight}px` }}
                                            title={`Income: ${formatCurrency(row.income)}`}
                                        />
                                        <div
                                            className={styles.barExpense}
                                            style={{ height: `${(row.expense / chartMax) * barHeight}px` }}
                                            title={`Expense: ${formatCurrency(row.expense)}`}
                                        />
                                    </div>
                                    <div className={styles.barLabel}>{getMonthLabel(row.month + "-01")}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Category Breakdown ── */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3>Category Breakdown</h3>
                        <span className={styles.chartSub}>{categoryRows.length} categories</span>
                    </div>

                    {categoryRows.length === 0 ? (
                        <div className={styles.emptyChart}>
                            <BarChart3 size={36} color="var(--color-text-muted)" />
                            <p>No category data</p>
                        </div>
                    ) : (
                        <div className={styles.categoryList}>
                            {categoryRows.map((cat, idx) => (
                                <div key={cat.category} className={styles.categoryRow}>
                                    <div className={styles.categoryMeta}>
                                        <span
                                            className={styles.categoryDot}
                                            style={{ background: CAT_COLORS[idx % CAT_COLORS.length] }}
                                        />
                                        <span className={styles.categoryName}>{cat.category}</span>
                                        <span className={styles.categoryCount}>{cat.count} entries</span>
                                    </div>
                                    <div className={styles.categoryRight}>
                                        <span className={styles.categoryAmount}>{formatCurrency(cat.total)}</span>
                                        <span className={styles.categoryPercent}>{cat.percent.toFixed(1)}%</span>
                                    </div>
                                    <div className={styles.categoryBar}>
                                        <div
                                            className={styles.categoryBarFill}
                                            style={{
                                                width: `${cat.percent}%`,
                                                background: CAT_COLORS[idx % CAT_COLORS.length],
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Monthly Summary Table ── */}
            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <h3>Monthly Summary</h3>
                </div>
                {monthlyRows.length === 0 ? (
                    <div className={styles.emptyTable}>
                        <p>No data available.</p>
                    </div>
                ) : (
                    <div className={styles.tableScroll}>
                        <table className="km-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Total Income</th>
                                    <th>Total Expenses</th>
                                    <th>Net Balance</th>
                                    <th>Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyRows.map((row) => {
                                    const margin = row.income > 0 ? ((row.net / row.income) * 100).toFixed(1) : "0.0";
                                    return (
                                        <tr key={row.month}>
                                            <td style={{ fontWeight: 500 }}>{getMonthLabel(row.month + "-01")}</td>
                                            <td style={{ color: "#16A34A", fontWeight: 500 }}>{formatCurrency(row.income)}</td>
                                            <td style={{ color: "#EF4444", fontWeight: 500 }}>{formatCurrency(row.expense)}</td>
                                            <td style={{ color: row.net >= 0 ? "#1E40AF" : "#EF4444", fontWeight: 600 }}>
                                                {row.net >= 0 ? "+" : ""}{formatCurrency(row.net)}
                                            </td>
                                            <td>
                                                <span className={`km-badge ${Number(margin) >= 0 ? "km-badge-success" : "km-badge-error"}`}>
                                                    {margin}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className={styles.totalRow}>
                                    <td style={{ fontWeight: 700 }}>Total</td>
                                    <td style={{ color: "#16A34A", fontWeight: 700 }}>{formatCurrency(totalIncome)}</td>
                                    <td style={{ color: "#EF4444", fontWeight: 700 }}>{formatCurrency(totalExpense)}</td>
                                    <td style={{ color: netBalance >= 0 ? "#1E40AF" : "#EF4444", fontWeight: 700 }}>
                                        {netBalance >= 0 ? "+" : ""}{formatCurrency(netBalance)}
                                    </td>
                                    <td>
                                        <span className={`km-badge ${Number(profitMargin) >= 0 ? "km-badge-primary" : "km-badge-error"}`}>
                                            {profitMargin}%
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
