"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import {
    Users,
    Shield,
    Eye,
    Crown,
    CheckCircle2,
    XCircle,
    Loader2,
    User2,
} from "lucide-react";
import styles from "./users.module.css";

interface StaffMember {
    id: string;
    full_name?: string;
    role: "admin" | "viewer";
    phone?: string;
    created_at: string;
    email: string;
}

interface Props {
    staffList: StaffMember[];
    currentUserId: string;
}

export default function UsersClient({ staffList, currentUserId }: Props) {
    const [staff, setStaff] = useState<StaffMember[]>(staffList);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const supabase = createClient();

    const adminCount = staff.filter((s) => s.role === "admin").length;
    const viewerCount = staff.filter((s) => s.role === "viewer").length;

    const handleToggleRole = async (member: StaffMember) => {
        if (member.id === currentUserId) {
            setErrorMsg("You cannot change your own role.");
            setTimeout(() => setErrorMsg(null), 3000);
            return;
        }

        const newRole = member.role === "admin" ? "viewer" : "admin";
        setTogglingId(member.id);
        setErrorMsg(null);

        const { error } = await supabase
            .from("profiles")
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq("id", member.id);

        if (error) {
            setErrorMsg("Failed to update role. Please try again.");
        } else {
            setStaff((prev) =>
                prev.map((s) => (s.id === member.id ? { ...s, role: newRole } : s))
            );
            setSuccessId(member.id);
            setTimeout(() => setSuccessId(null), 2000);
        }
        setTogglingId(null);
    };

    return (
        <div className={styles.page}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>User Management</h2>
                    <p>Manage staff accounts and role permissions</p>
                </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className={styles.summaryRow}>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon} style={{ background: "#EFF6FF" }}>
                        <Users size={22} color="#1E40AF" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>Total Staff</div>
                        <div className={styles.summaryValue}>{staff.length}</div>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon} style={{ background: "#FEF9E7" }}>
                        <Crown size={22} color="#B8940F" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>Admins</div>
                        <div className={styles.summaryValue} style={{ color: "#B8940F" }}>{adminCount}</div>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon} style={{ background: "#F0FDF4" }}>
                        <Eye size={22} color="#16A34A" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>Viewers</div>
                        <div className={styles.summaryValue} style={{ color: "#16A34A" }}>{viewerCount}</div>
                    </div>
                </div>
            </div>

            {/* ── RBAC Info Banner ── */}
            <div className={styles.infoBanner}>
                <Shield size={16} color="#1E40AF" />
                <span>
                    <strong>Admin</strong> — full access: create, edit, delete entries, manage bookings &amp; users.&nbsp;
                    <strong>Viewer</strong> — read-only: can view ledger, bookings, and reports but cannot make changes.
                </span>
            </div>

            {/* ── Error Toast ── */}
            {errorMsg && (
                <div className={styles.errorToast}>
                    <XCircle size={16} />
                    {errorMsg}
                </div>
            )}

            {/* ── Staff Table ── */}
            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <h3>Staff Members</h3>
                    <span className={styles.tableCount}>{staff.length} total</span>
                </div>

                {staff.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Users size={48} color="var(--color-text-muted)" />
                        <h3>No staff accounts yet</h3>
                        <p>Staff members will appear here after they sign up via /signup.</p>
                    </div>
                ) : (
                    <div className={styles.tableScroll}>
                        <table className="km-table">
                            <thead>
                                <tr>
                                    <th>Staff Member</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Joined</th>
                                    <th>Current Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map((member) => {
                                    const isMe = member.id === currentUserId;
                                    const isToggling = togglingId === member.id;
                                    const wasSuccess = successId === member.id;

                                    return (
                                        <tr key={member.id} className={isMe ? styles.currentUserRow : ""}>
                                            <td>
                                                <div className={styles.memberCell}>
                                                    <div className={styles.avatar}>
                                                        <User2 size={16} />
                                                    </div>
                                                    <div>
                                                        <div className={styles.memberName}>
                                                            {member.full_name || "—"}
                                                            {isMe && <span className={styles.youBadge}>You</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={styles.emailCell}>{member.email}</td>
                                            <td>{member.phone || "—"}</td>
                                            <td>{formatDateTime(member.created_at)}</td>
                                            <td>
                                                {member.role === "admin" ? (
                                                    <span className={`${styles.roleBadge} ${styles.roleBadgeAdmin}`}>
                                                        <Crown size={12} /> Admin
                                                    </span>
                                                ) : (
                                                    <span className={`${styles.roleBadge} ${styles.roleBadgeViewer}`}>
                                                        <Eye size={12} /> Viewer
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {isMe ? (
                                                    <span className={styles.selfNote}>Cannot change own role</span>
                                                ) : wasSuccess ? (
                                                    <span className={styles.successNote}>
                                                        <CheckCircle2 size={14} /> Updated!
                                                    </span>
                                                ) : (
                                                    <button
                                                        className={
                                                            member.role === "admin"
                                                                ? styles.demoteBtn
                                                                : styles.promoteBtn
                                                        }
                                                        onClick={() => handleToggleRole(member)}
                                                        disabled={isToggling}
                                                    >
                                                        {isToggling ? (
                                                            <Loader2 size={13} className={styles.spinner} />
                                                        ) : member.role === "admin" ? (
                                                            <>
                                                                <Eye size={13} /> Make Viewer
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Crown size={13} /> Make Admin
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
