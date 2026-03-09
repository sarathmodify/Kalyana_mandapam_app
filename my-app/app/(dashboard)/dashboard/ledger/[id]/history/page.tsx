"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { LedgerAuditLog } from "@/types/ledger";
import Link from "next/link";
import {
    ArrowLeft,
    Loader2,
    PlusCircle,
    Pencil,
    Trash2,
    History,
    User,
} from "lucide-react";
import styles from "./history.module.css";

interface AuditLogWithUser extends LedgerAuditLog {
    profiles?: { full_name: string | null };
}

export default function LedgerHistoryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [logs, setLogs] = useState<AuditLogWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [entryTitle, setEntryTitle] = useState("");

    useEffect(() => {
        async function fetchHistory() {
            const supabase = createClient();

            // Run all independent queries in parallel (3x faster)
            const [userResult, entryResult, auditResult] = await Promise.all([
                supabase.auth.getUser(),
                supabase
                    .from("ledger_entries")
                    .select("description, amount, type")
                    .eq("id", id)
                    .single(),
                supabase
                    .from("ledger_audit_log")
                    .select("*")
                    .eq("entry_id", id)
                    .order("changed_at", { ascending: false }),
            ]);

            const currentUser = userResult.data?.user;
            const entry = entryResult.data;
            const auditData = auditResult.data;

            // Set entry title
            if (entry) {
                setEntryTitle(`${entry.description} — ${entry.type === "income" ? "+" : "−"}₹${entry.amount}`);
            } else {
                setEntryTitle("Deleted Entry");
            }

            if (auditResult.error || !auditData) {
                setLoading(false);
                return;
            }

            // Collect unique user IDs from logs
            const userIds = [...new Set(
                auditData
                    .map((log: { changed_by: string | null }) => log.changed_by)
                    .filter((uid: string | null): uid is string => !!uid)
            )];

            // Fetch profiles for those user IDs
            let profileMap: Record<string, string> = {};
            if (userIds.length > 0) {
                const { data: profiles } = await supabase
                    .from("profiles")
                    .select("id, full_name")
                    .in("id", userIds);

                if (profiles) {
                    profileMap = Object.fromEntries(
                        profiles.map((p: { id: string; full_name: string | null }) => [p.id, p.full_name || ""])
                    );
                }
            }

            // Merge profile names into logs, with email fallback
            const logsWithUsers: AuditLogWithUser[] = auditData.map((log: Record<string, unknown>) => {
                let displayName: string | null = null;
                if (log.changed_by) {
                    displayName = profileMap[log.changed_by as string] || null;
                    // Fallback: if it's the current user and name is empty, use their email
                    if (!displayName && currentUser && log.changed_by === currentUser.id) {
                        displayName = currentUser.email || null;
                    }
                }
                return {
                    ...log,
                    profiles: { full_name: displayName },
                };
            });

            setLogs(logsWithUsers);
            setLoading(false);
        }
        fetchHistory();
    }, [id]);

    const getActionMeta = (action: string) => {
        switch (action) {
            case "create":
                return { icon: PlusCircle, label: "Created", color: "#16A34A", bg: "#F0FDF4" };
            case "update":
                return { icon: Pencil, label: "Edited", color: "#D97706", bg: "#FFFBEB" };
            case "delete":
                return { icon: Trash2, label: "Deleted", color: "#EF4444", bg: "#FEF2F2" };
            default:
                return { icon: History, label: action, color: "#64748B", bg: "#F1F5F9" };
        }
    };

    // Detect meaningful field changes between old_data and new_data
    const getChanges = (log: AuditLogWithUser): { field: string; from: string; to: string }[] => {
        if (log.action !== "update" || !log.old_data || !log.new_data) return [];

        const TRACK_FIELDS = [
            "description", "amount", "type", "category",
            "payment_method", "date", "reference_no", "notes",
        ];
        const changes: { field: string; from: string; to: string }[] = [];

        for (const field of TRACK_FIELDS) {
            const old_data = log.old_data as Record<string, unknown>;
            const new_data = log.new_data as Record<string, unknown>;
            const oldVal = String(old_data[field] ?? "—");
            const newVal = String(new_data[field] ?? "—");
            if (oldVal !== newVal) {
                changes.push({
                    field: field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                    from: field === "amount" ? formatCurrency(Number(oldVal)) : oldVal,
                    to: field === "amount" ? formatCurrency(Number(newVal)) : newVal,
                });
            }
        }
        return changes;
    };

    return (
        <div className={styles.page}>
            <Link href="/dashboard/ledger" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Ledger
            </Link>

            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <History size={24} color="#1E40AF" />
                </div>
                <div>
                    <h2>Edit History</h2>
                    <p className={styles.entryTitle}>{entryTitle}</p>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <Loader2 size={28} className={styles.spin} color="#1E40AF" />
                    <p>Loading history…</p>
                </div>
            ) : logs.length === 0 ? (
                <div className={styles.empty}>
                    <History size={48} color="var(--color-text-muted)" />
                    <h3>No History Available</h3>
                    <p>No audit logs found for this entry.</p>
                </div>
            ) : (
                <div className={styles.timeline}>
                    {logs.map((log, idx) => {
                        const meta = getActionMeta(log.action);
                        const ActionIcon = meta.icon;
                        const changes = getChanges(log);
                        const isLast = idx === logs.length - 1;

                        return (
                            <div key={log.id} className={styles.timelineItem}>
                                {/* Connector line */}
                                {!isLast && <div className={styles.connector} />}

                                {/* Icon */}
                                <div
                                    className={styles.timelineIcon}
                                    style={{ background: meta.bg, color: meta.color }}
                                >
                                    <ActionIcon size={16} />
                                </div>

                                {/* Content */}
                                <div className={styles.timelineContent}>
                                    <div className={styles.timelineHeader}>
                                        <span
                                            className={styles.actionBadge}
                                            style={{ background: meta.bg, color: meta.color }}
                                        >
                                            {meta.label}
                                        </span>
                                        <span className={styles.timelineDate}>
                                            {formatDateTime(log.changed_at)}
                                        </span>
                                    </div>

                                    <div className={styles.changedBy}>
                                        <User size={14} />
                                        <span>{log.profiles?.full_name || "Unknown User"}</span>
                                    </div>

                                    {/* Show field changes for updates */}
                                    {changes.length > 0 && (
                                        <div className={styles.changesList}>
                                            {changes.map((change, i) => (
                                                <div key={i} className={styles.changeRow}>
                                                    <span className={styles.changeField}>{change.field}:</span>
                                                    <span className={styles.changeFrom}>{change.from}</span>
                                                    <span className={styles.changeArrow}>→</span>
                                                    <span className={styles.changeTo}>{change.to}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Show snapshot for create/delete */}
                                    {log.action === "create" && log.new_data && (() => {
                                        const nd = log.new_data as Record<string, unknown>;
                                        return (
                                            <div className={styles.snapshot}>
                                                <span>Amount: {formatCurrency(Number(nd.amount))}</span>
                                                <span>Type: {String(nd.type)}</span>
                                                {Boolean(nd.category) && (
                                                    <span>Category: {String(nd.category)}</span>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
