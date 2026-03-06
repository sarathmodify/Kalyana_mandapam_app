"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/hooks/useRole";
import { formatDateTime } from "@/lib/utils";
import {
    MessageSquare,
    Loader2,
    ChevronDown,
    ChevronUp,
    Mail,
    Phone,
    Calendar,
    Inbox,
    CheckCheck,
    Eye,
} from "lucide-react";
import styles from "./inquiries.module.css";

interface Inquiry {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    event_date?: string;
    message?: string;
    status: "new" | "read" | "replied";
    created_at: string;
}

type FilterStatus = "all" | "new" | "read" | "replied";

const STATUS_OPTIONS: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "new", label: "New" },
    { value: "read", label: "Read" },
    { value: "replied", label: "Replied" },
];

const STATUS_META = {
    new: { label: "New", icon: Inbox, badgeClass: "km-badge-error", bg: "#FEF2F2", color: "#EF4444" },
    read: { label: "Read", icon: Eye, badgeClass: "km-badge-warning", bg: "#FFFBEB", color: "#D97706" },
    replied: { label: "Replied", icon: CheckCheck, badgeClass: "km-badge-success", bg: "#F0FDF4", color: "#16A34A" },
};

export default function InquiriesPage() {
    const { isAdmin } = useRole();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const supabase = createClient();

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("contact_inquiries")
            .select("*")
            .order("created_at", { ascending: false });
        if (!error && data) setInquiries(data as Inquiry[]);
        setLoading(false);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    // Mark as "read" automatically when expanded
    const handleExpand = async (inquiry: Inquiry) => {
        if (expandedId === inquiry.id) {
            setExpandedId(null);
            return;
        }
        setExpandedId(inquiry.id);
        if (inquiry.status === "new") {
            await supabase
                .from("contact_inquiries")
                .update({ status: "read" })
                .eq("id", inquiry.id);
            setInquiries((prev) =>
                prev.map((q) => (q.id === inquiry.id ? { ...q, status: "read" } : q))
            );
        }
    };

    const handleStatusChange = async (id: string, newStatus: "new" | "read" | "replied") => {
        setUpdatingId(id);
        await supabase
            .from("contact_inquiries")
            .update({ status: newStatus })
            .eq("id", id);
        setInquiries((prev) =>
            prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
        );
        setUpdatingId(null);
    };

    const filtered = inquiries.filter((q) =>
        statusFilter === "all" ? true : q.status === statusFilter
    );

    const newCount = inquiries.filter((q) => q.status === "new").length;
    const readCount = inquiries.filter((q) => q.status === "read").length;
    const repliedCount = inquiries.filter((q) => q.status === "replied").length;

    return (
        <div className={styles.page}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>Inquiries</h2>
                    <p>Contact form submissions from potential clients</p>
                </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className={styles.summaryRow}>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon} style={{ background: "#EFF6FF" }}>
                        <MessageSquare size={20} color="#1E40AF" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>Total</div>
                        <div className={styles.summaryValue}>{inquiries.length}</div>
                    </div>
                </div>
                <div className={styles.summaryCard} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("new")}>
                    <div className={styles.summaryIcon} style={{ background: "#FEF2F2" }}>
                        <Inbox size={20} color="#EF4444" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>New</div>
                        <div className={styles.summaryValue} style={{ color: "#EF4444" }}>{newCount}</div>
                    </div>
                    {newCount > 0 && <span className={styles.pulseDot} />}
                </div>
                <div className={styles.summaryCard} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("read")}>
                    <div className={styles.summaryIcon} style={{ background: "#FFFBEB" }}>
                        <Eye size={20} color="#D97706" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>Read</div>
                        <div className={styles.summaryValue} style={{ color: "#D97706" }}>{readCount}</div>
                    </div>
                </div>
                <div className={styles.summaryCard} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("replied")}>
                    <div className={styles.summaryIcon} style={{ background: "#F0FDF4" }}>
                        <CheckCheck size={20} color="#16A34A" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>Replied</div>
                        <div className={styles.summaryValue} style={{ color: "#16A34A" }}>{repliedCount}</div>
                    </div>
                </div>
            </div>

            {/* ── Filter Tabs ── */}
            <div className={styles.filterTabs}>
                {STATUS_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        className={`${styles.filterTab} ${statusFilter === opt.value ? styles.filterTabActive : ""}`}
                        onClick={() => setStatusFilter(opt.value)}
                    >
                        {opt.label}
                        {opt.value !== "all" && (
                            <span className={styles.filterCount}>
                                {opt.value === "new" ? newCount : opt.value === "read" ? readCount : repliedCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Inquiry List ── */}
            {loading ? (
                <div className={styles.loadingWrap}>
                    <Loader2 size={32} className={styles.spinner} color="#1E40AF" />
                    <p>Loading inquiries…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className={styles.emptyState}>
                    <MessageSquare size={48} color="var(--color-text-muted)" />
                    <h3>{statusFilter === "all" ? "No inquiries yet" : `No ${statusFilter} inquiries`}</h3>
                    <p>
                        {statusFilter === "all"
                            ? "Contact form submissions from your website will appear here."
                            : `There are no inquiries with '${statusFilter}' status.`}
                    </p>
                </div>
            ) : (
                <div className={styles.inquiryList}>
                    {filtered.map((inquiry) => {
                        const meta = STATUS_META[inquiry.status];
                        const StatusIcon = meta.icon;
                        const isExpanded = expandedId === inquiry.id;
                        const isUpdating = updatingId === inquiry.id;

                        return (
                            <div
                                key={inquiry.id}
                                className={`${styles.inquiryCard} ${inquiry.status === "new" ? styles.inquiryCardNew : ""}`}
                            >
                                {/* ── Card Header (always visible) ── */}
                                <div
                                    className={styles.cardTop}
                                    onClick={() => handleExpand(inquiry)}
                                >
                                    <div className={styles.cardLeft}>
                                        {/* New indicator dot */}
                                        {inquiry.status === "new" && <span className={styles.newDot} />}
                                        <div className={styles.cardInfo}>
                                            <div className={styles.cardName}>{inquiry.name}</div>
                                            <div className={styles.cardMeta}>
                                                {inquiry.phone && (
                                                    <span className={styles.metaItem}>
                                                        <Phone size={12} /> {inquiry.phone}
                                                    </span>
                                                )}
                                                {inquiry.email && (
                                                    <span className={styles.metaItem}>
                                                        <Mail size={12} /> {inquiry.email}
                                                    </span>
                                                )}
                                                {inquiry.event_date && (
                                                    <span className={styles.metaItem}>
                                                        <Calendar size={12} /> {inquiry.event_date}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.cardRight}>
                                        <span className={styles.cardDate}>
                                            {formatDateTime(inquiry.created_at)}
                                        </span>
                                        <span className={`km-badge ${meta.badgeClass}`}>
                                            <StatusIcon size={11} /> {meta.label}
                                        </span>
                                        <button className={styles.expandBtn}>
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* ── Expanded Details ── */}
                                {isExpanded && (
                                    <div className={styles.cardBody}>
                                        <hr className="km-divider" style={{ margin: "0 0 var(--space-4)" }} />
                                        <div className={styles.messageBlock}>
                                            <div className={styles.messageLabel}>Message</div>
                                            <p className={styles.messageText}>
                                                {inquiry.message || <em>No message provided.</em>}
                                            </p>
                                        </div>

                                        {isAdmin && (
                                            <div className={styles.statusActions}>
                                                <span className={styles.statusActionLabel}>Mark as:</span>
                                                {(["new", "read", "replied"] as const).map((s) => (
                                                    <button
                                                        key={s}
                                                        className={`${styles.statusBtn} ${inquiry.status === s ? styles.statusBtnActive : ""}`}
                                                        style={inquiry.status === s ? { background: STATUS_META[s].bg, color: STATUS_META[s].color } : {}}
                                                        onClick={() => handleStatusChange(inquiry.id, s)}
                                                        disabled={isUpdating || inquiry.status === s}
                                                    >
                                                        {isUpdating && inquiry.status !== s ? (
                                                            <Loader2 size={12} className={styles.spinner} />
                                                        ) : null}
                                                        {STATUS_META[s].label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
