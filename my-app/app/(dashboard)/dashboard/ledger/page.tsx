"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/hooks/useRole";
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils";
import { LEDGER_CATEGORIES, PAYMENT_METHODS } from "@/constants";
import type { LedgerEntry } from "@/types/ledger";
import Link from "next/link";
import {
    Plus,
    Download,
    Pencil,
    Trash2,
    TrendingUp,
    TrendingDown,
    Wallet,
    Loader2,
    BookOpen,
    Search,
    X,
} from "lucide-react";
import styles from "./ledger.module.css";

export default function LedgerPage() {
    const { isAdmin } = useRole();
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Filters
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const supabase = createClient();

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("ledger_entries")
            .select("*")
            .order("date", { ascending: false });

        if (!error && data) {
            setEntries(data as LedgerEntry[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    // Filtered entries
    const filteredEntries = entries.filter((entry) => {
        if (typeFilter !== "all" && entry.type !== typeFilter) return false;
        if (categoryFilter !== "all" && entry.category !== categoryFilter) return false;
        if (searchQuery && !entry.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (dateFrom && entry.date < dateFrom) return false;
        if (dateTo && entry.date > dateTo) return false;
        return true;
    });

    // Summary calculations
    const totalIncome = filteredEntries
        .filter((e) => e.type === "income")
        .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalExpenses = filteredEntries
        .filter((e) => e.type === "expense")
        .reduce((sum, e) => sum + Number(e.amount), 0);

    const netBalance = totalIncome - totalExpenses;

    const hasFilters = typeFilter !== "all" || categoryFilter !== "all" || searchQuery || dateFrom || dateTo;

    const clearFilters = () => {
        setTypeFilter("all");
        setCategoryFilter("all");
        setSearchQuery("");
        setDateFrom("");
        setDateTo("");
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        await supabase.from("ledger_entries").delete().eq("id", deleteId);
        setDeleteId(null);
        setDeleting(false);
        fetchEntries();
    };

    const handleExport = () => {
        const exportData = filteredEntries.map((e) => ({
            Date: e.date,
            Description: e.description,
            Amount: e.amount,
            Type: e.type,
            Category: e.category || "",
            "Payment Method": PAYMENT_METHODS.find((p) => p.value === e.payment_method)?.label || "",
            "Reference No": e.reference_no || "",
            Notes: e.notes || "",
        }));
        exportToCSV(exportData, `ledger-export-${new Date().toISOString().split("T")[0]}`);
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>Ledger</h2>
                    <p>Track all income and expenses</p>
                </div>
                <div className={styles.headerActions}>
                    {isAdmin && (
                        <button className="km-btn-outline" onClick={handleExport}>
                            <Download size={16} /> Export CSV
                        </button>
                    )}
                    {isAdmin && (
                        <Link href="/dashboard/ledger/add" className="km-btn-primary">
                            <Plus size={16} /> Add Entry
                        </Link>
                    )}
                </div>
            </div>

            {/* Summary Bar */}
            <div className={styles.summaryBar}>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryIcon} style={{ background: "#F0FDF4" }}>
                        <TrendingUp size={20} color="#16A34A" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>Income</div>
                        <div className={styles.summaryValue} style={{ color: "#16A34A" }}>
                            {formatCurrency(totalIncome)}
                        </div>
                    </div>
                </div>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryIcon} style={{ background: "#FEF2F2" }}>
                        <TrendingDown size={20} color="#EF4444" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>Expenses</div>
                        <div className={styles.summaryValue} style={{ color: "#EF4444" }}>
                            {formatCurrency(totalExpenses)}
                        </div>
                    </div>
                </div>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryIcon} style={{ background: "#EFF6FF" }}>
                        <Wallet size={20} color="#1E40AF" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>Net Balance</div>
                        <div className={styles.summaryValue} style={{ color: netBalance >= 0 ? "#1E40AF" : "#EF4444" }}>
                            {formatCurrency(netBalance)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className={styles.filterBar}>
                <div className={`${styles.filterGroup} ${styles.searchGroup}`}>
                    <label>Search</label>
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Search descriptions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className={styles.filterGroup}>
                    <label>Type</label>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <label>Category</label>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="all">All Categories</option>
                        {LEDGER_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <label>From</label>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className={styles.filterGroup}>
                    <label>To</label>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                {hasFilters && (
                    <button className={styles.clearBtn} onClick={clearFilters}>
                        <X size={14} /> Clear
                    </button>
                )}
            </div>

            {/* Table */}
            <div className={styles.tableCard}>
                <div className={styles.tableInfo}>
                    <span className={styles.tableCount}>
                        Showing <strong>{filteredEntries.length}</strong> of{" "}
                        <strong>{entries.length}</strong> entries
                    </span>
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <Loader2 size={28} className={styles.spinner} color="#1E40AF" />
                        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>Loading entries...</p>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <BookOpen size={48} color="var(--color-text-muted)" />
                        </div>
                        <h3>{hasFilters ? "No matching entries" : "No ledger entries yet"}</h3>
                        <p>
                            {hasFilters
                                ? "Try adjusting your filters to find what you're looking for."
                                : "Start by adding your first income or expense entry."}
                        </p>
                        {!hasFilters && isAdmin && (
                            <Link href="/dashboard/ledger/add" className="km-btn-primary">
                                <Plus size={16} /> Add First Entry
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className={styles.tableScroll}>
                        <table className="km-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Amount (₹)</th>
                                    <th>Type</th>
                                    <th>Payment</th>
                                    {isAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((entry) => (
                                    <tr key={entry.id}>
                                        <td>{formatDate(entry.date)}</td>
                                        <td>{entry.description}</td>
                                        <td>{entry.category || "—"}</td>
                                        <td className={entry.type === "income" ? styles.amountIncome : styles.amountExpense}>
                                            {entry.type === "income" ? "+" : "−"}{" "}
                                            {formatCurrency(Number(entry.amount))}
                                        </td>
                                        <td>
                                            <span className={`km-badge ${entry.type === "income" ? "km-badge-success" : "km-badge-error"}`}>
                                                {entry.type}
                                            </span>
                                        </td>
                                        <td>
                                            {PAYMENT_METHODS.find((p) => p.value === entry.payment_method)?.label || "—"}
                                        </td>
                                        {isAdmin && (
                                            <td>
                                                <div className={styles.actions}>
                                                    <Link
                                                        href={`/dashboard/ledger/edit/${entry.id}`}
                                                        className={`${styles.actionBtn} ${styles.editBtn}`}
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button
                                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                        onClick={() => setDeleteId(entry.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalIcon}>⚠️</div>
                        <h3>Delete Entry</h3>
                        <p>Are you sure you want to delete this ledger entry? This action cannot be undone.</p>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setDeleteId(null)} disabled={deleting}>
                                Cancel
                            </button>
                            <button className={styles.confirmDeleteBtn} onClick={handleDelete} disabled={deleting}>
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
