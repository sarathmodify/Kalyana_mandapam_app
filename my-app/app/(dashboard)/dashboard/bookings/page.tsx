"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/hooks/useRole";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EVENT_TYPES, BOOKING_STATUSES } from "@/constants";
import type { Booking } from "@/types/booking";
import Link from "next/link";
import {
    Plus,
    Loader2,
    Calendar,
    TableProperties,
    ChevronLeft,
    ChevronRight,
    CalendarCheck,
    CalendarX,
    CalendarClock,
    Users,
    Pencil,
    Trash2,
    X,
} from "lucide-react";
import styles from "./bookings.module.css";

export default function BookingsPage() {
    const { isAdmin } = useRole();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"table" | "calendar">("table");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [eventTypeFilter, setEventTypeFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Calendar state
    const [calendarDate, setCalendarDate] = useState(new Date());

    const supabase = createClient();

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .order("event_date", { ascending: true });

        if (!error && data) {
            setBookings(data as Booking[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Filtered bookings
    const filteredBookings = bookings.filter((b) => {
        if (statusFilter !== "all" && b.status !== statusFilter) return false;
        if (eventTypeFilter !== "all" && b.event_type !== eventTypeFilter) return false;
        if (searchQuery && !b.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Summary stats
    const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
    const tentativeCount = bookings.filter((b) => b.status === "tentative").length;
    const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
    const totalGuests = bookings
        .filter((b) => b.status !== "cancelled")
        .reduce((sum, b) => sum + (b.guest_count || 0), 0);

    const hasFilters = statusFilter !== "all" || eventTypeFilter !== "all" || searchQuery;

    const clearFilters = () => {
        setStatusFilter("all");
        setEventTypeFilter("all");
        setSearchQuery("");
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        await supabase.from("bookings").delete().eq("id", deleteId);
        setDeleteId(null);
        setDeleting(false);
        fetchBookings();
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        await supabase
            .from("bookings")
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq("id", id);
        fetchBookings();
    };

    // ── Calendar Helpers ────────────────────────────────────────
    const calYear = calendarDate.getFullYear();
    const calMonth = calendarDate.getMonth();
    const monthName = calendarDate.toLocaleString("en-IN", { month: "long", year: "numeric" });
    const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date();

    const prevMonth = () => setCalendarDate(new Date(calYear, calMonth - 1, 1));
    const nextMonth = () => setCalendarDate(new Date(calYear, calMonth + 1, 1));

    const getBookingsForDay = (day: number) => {
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return bookings.filter((b) => b.event_date === dateStr);
    };

    const isToday = (day: number) =>
        today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day;

    const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>Bookings</h2>
                    <p>Manage hall bookings and events</p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.viewToggle}>
                        <button
                            className={`${styles.viewBtn} ${view === "table" ? styles.viewBtnActive : ""}`}
                            onClick={() => setView("table")}
                        >
                            <TableProperties size={16} /> Table
                        </button>
                        <button
                            className={`${styles.viewBtn} ${view === "calendar" ? styles.viewBtnActive : ""}`}
                            onClick={() => setView("calendar")}
                        >
                            <Calendar size={16} /> Calendar
                        </button>
                    </div>
                    {isAdmin && (
                        <Link href="/dashboard/bookings/add" className="km-btn-primary">
                            <Plus size={16} /> Add Booking
                        </Link>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className={styles.summaryBar}>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryIcon} style={{ background: "#F0FDF4" }}>
                        <CalendarCheck size={20} color="#16A34A" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>Confirmed</div>
                        <div className={styles.summaryValue} style={{ color: "#16A34A" }}>{confirmedCount}</div>
                    </div>
                </div>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryIcon} style={{ background: "#FFFBEB" }}>
                        <CalendarClock size={20} color="#D97706" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>Tentative</div>
                        <div className={styles.summaryValue} style={{ color: "#D97706" }}>{tentativeCount}</div>
                    </div>
                </div>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryIcon} style={{ background: "#FEF2F2" }}>
                        <CalendarX size={20} color="#EF4444" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>Cancelled</div>
                        <div className={styles.summaryValue} style={{ color: "#EF4444" }}>{cancelledCount}</div>
                    </div>
                </div>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryIcon} style={{ background: "#FAF5FF" }}>
                        <Users size={20} color="#9333EA" />
                    </div>
                    <div>
                        <div className={styles.summaryLabel}>Total Guests</div>
                        <div className={styles.summaryValue} style={{ color: "#9333EA" }}>{totalGuests.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* ═══════ TABLE VIEW ═══════ */}
            {view === "table" && (
                <>
                    {/* Filter Bar */}
                    <div className={styles.filterBar}>
                        <div className={`${styles.filterGroup} ${styles.searchGroup}`}>
                            <label>Search</label>
                            <input
                                type="text"
                                placeholder="Search by customer name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterGroup}>
                            <label>Status</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Statuses</option>
                                {BOOKING_STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.filterGroup}>
                            <label>Event Type</label>
                            <select value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)}>
                                <option value="all">All Types</option>
                                {EVENT_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        {hasFilters && (
                            <button className={styles.clearBtn} onClick={clearFilters}>
                                <X size={14} /> Clear
                            </button>
                        )}
                    </div>

                    <div className={styles.tableCard}>
                        <div className={styles.tableInfo}>
                            <span className={styles.tableCount}>
                                Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
                            </span>
                        </div>

                        {loading ? (
                            <div className={styles.loading}>
                                <Loader2 size={28} className={styles.spinner} color="#1E40AF" />
                                <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>Loading bookings...</p>
                            </div>
                        ) : filteredBookings.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Calendar size={48} color="var(--color-text-muted)" />
                                <h3>{hasFilters ? "No matching bookings" : "No bookings yet"}</h3>
                                <p>{hasFilters ? "Try adjusting your filters." : "Start by adding your first booking."}</p>
                                {!hasFilters && isAdmin && (
                                    <Link href="/dashboard/bookings/add" className="km-btn-primary">
                                        <Plus size={16} /> Add First Booking
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className={styles.tableScroll}>
                                <table className="km-table">
                                    <thead>
                                        <tr>
                                            <th>Event Date</th>
                                            <th>Customer</th>
                                            <th>Phone</th>
                                            <th>Event Type</th>
                                            <th>Guests</th>
                                            <th>Advance (₹)</th>
                                            <th>Status</th>
                                            {isAdmin && <th>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBookings.map((booking) => (
                                            <tr key={booking.id}>
                                                <td style={{ fontWeight: 500 }}>{formatDate(booking.event_date)}</td>
                                                <td>{booking.customer_name}</td>
                                                <td>{booking.customer_phone}</td>
                                                <td>{booking.event_type || "—"}</td>
                                                <td>{booking.guest_count || "—"}</td>
                                                <td>{booking.advance_amount ? formatCurrency(Number(booking.advance_amount)) : "—"}</td>
                                                <td>
                                                    {isAdmin ? (
                                                        <select
                                                            className={styles.statusSelect}
                                                            value={booking.status}
                                                            onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                                        >
                                                            {BOOKING_STATUSES.map((s) => (
                                                                <option key={s.value} value={s.value}>{s.label}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className={`km-badge ${booking.status === "confirmed" ? "km-badge-success"
                                                            : booking.status === "tentative" ? "km-badge-warning"
                                                                : "km-badge-error"
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    )}
                                                </td>
                                                {isAdmin && (
                                                    <td>
                                                        <div className={styles.actions}>
                                                            <Link
                                                                href={`/dashboard/bookings/edit/${booking.id}`}
                                                                className={`${styles.actionBtn} ${styles.editBtn}`}
                                                                title="Edit"
                                                            >
                                                                <Pencil size={16} />
                                                            </Link>
                                                            <button
                                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                                onClick={() => setDeleteId(booking.id)}
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
                </>
            )}

            {/* ═══════ CALENDAR VIEW ═══════ */}
            {view === "calendar" && (
                <div className={styles.calendarCard}>
                    <div className={styles.calendarHeader}>
                        <h3 className={styles.calendarTitle}>{monthName}</h3>
                        <div className={styles.calendarNav}>
                            <button className={styles.calendarNavBtn} onClick={prevMonth}>
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                className={styles.calendarNavBtn}
                                onClick={() => setCalendarDate(new Date())}
                            >
                                Today
                            </button>
                            <button className={styles.calendarNavBtn} onClick={nextMonth}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.calendarGrid}>
                        {/* Day labels */}
                        {DAY_LABELS.map((label) => (
                            <div key={label} className={styles.calendarDayLabel}>
                                {label}
                            </div>
                        ))}

                        {/* Empty cells before first day */}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className={`${styles.calendarDay} ${styles.calendarDayEmpty}`} />
                        ))}

                        {/* Days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayBookings = getBookingsForDay(day);
                            return (
                                <div key={day} className={styles.calendarDay}>
                                    <div className={isToday(day) ? styles.calendarDayToday : styles.calendarDayNumber}>
                                        {day}
                                    </div>
                                    {dayBookings.map((b) => (
                                        <div
                                            key={b.id}
                                            className={`${styles.calendarEvent} ${b.status === "confirmed" ? styles.eventConfirmed
                                                : b.status === "tentative" ? styles.eventTentative
                                                    : styles.eventCancelled
                                                }`}
                                            title={`${b.customer_name} — ${b.event_type || "Event"} (${b.status})`}
                                        >
                                            {b.customer_name}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalIcon}>⚠️</div>
                        <h3>Delete Booking</h3>
                        <p>Are you sure you want to delete this booking? This action cannot be undone.</p>
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
