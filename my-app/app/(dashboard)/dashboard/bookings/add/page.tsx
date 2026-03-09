"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import { EVENT_TYPES, BOOKING_STATUSES } from "@/constants";
import Link from "next/link";
import {
    ArrowLeft,
    Save,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import styles from "./bookingform.module.css";

export default function AddBookingPage() {
    const router = useRouter();
    const { isAdmin, loading: roleLoading } = useRole();
    const { user } = useAuth();
    const supabase = createClient();

    const [formData, setFormData] = useState({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        event_date: "",
        event_type: "",
        guest_count: "",
        total_amount: "",
        advance_amount: "",
        status: "tentative",
        notes: "",
    });

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [dateConflict, setDateConflict] = useState<string | null>(null);

    // Check for date conflicts
    useEffect(() => {
        async function checkDate() {
            if (!formData.event_date) {
                setDateConflict(null);
                return;
            }
            const { data } = await supabase
                .from("bookings")
                .select("customer_name, status")
                .eq("event_date", formData.event_date)
                .neq("status", "cancelled");

            if (data && data.length > 0) {
                const names = data.map((b: { customer_name: string }) => b.customer_name).join(", ");
                setDateConflict(`This date already has ${data.length} booking(s): ${names}`);
            } else {
                setDateConflict(null);
            }
        }
        checkDate();
    }, [formData.event_date]);

    // Redirect non-admins
    useEffect(() => {
        if (!roleLoading && !isAdmin) {
            router.push("/dashboard/bookings");
        }
    }, [isAdmin, roleLoading, router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        if (!formData.customer_name.trim()) {
            setError("Customer name is required.");
            setSaving(false);
            return;
        }
        if (!formData.event_date) {
            setError("Event date is required.");
            setSaving(false);
            return;
        }

        const { error: insertError } = await supabase.from("bookings").insert({
            customer_name: formData.customer_name.trim(),
            customer_phone: formData.customer_phone || null,
            customer_email: formData.customer_email || null,
            event_date: formData.event_date,
            event_type: formData.event_type || null,
            guest_count: formData.guest_count ? Number(formData.guest_count) : null,
            total_amount: formData.total_amount ? Number(formData.total_amount) : null,
            advance_amount: formData.advance_amount ? Number(formData.advance_amount) : null,
            status: formData.status,
            notes: formData.notes || null,
            created_by: user?.id,
        });

        if (insertError) {
            setError(insertError.message);
            setSaving(false);
            return;
        }

        router.push("/dashboard/bookings");
    };

    if (roleLoading) {
        return (
            <div className={styles.page} style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                <Loader2 size={28} className={styles.spin} color="#1E40AF" />
            </div>
        );
    }

    console.log(roleLoading, 'roleloading')

    return (
        <div className={styles.page}>
            <Link href="/dashboard/bookings" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Bookings
            </Link>

            <div className={styles.header}>
                <h2>Add Booking</h2>
                <p>Create a new hall booking</p>
            </div>

            <div className={styles.card}>
                {error && (
                    <div className={styles.error}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* ── Customer Details ──────────────────────── */}
                    <h3 className={styles.sectionTitle}>Customer Details</h3>

                    <div className={styles.field}>
                        <label htmlFor="customer_name" className="km-label">Customer Name *</label>
                        <input
                            id="customer_name"
                            name="customer_name"
                            type="text"
                            className="km-input"
                            placeholder="e.g., Mr. Rajesh Kumar"
                            value={formData.customer_name}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label htmlFor="customer_phone" className="km-label">Phone Number</label>
                            <input
                                id="customer_phone"
                                name="customer_phone"
                                type="tel"
                                className="km-input"
                                placeholder="+91 98765 43210"
                                value={formData.customer_phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="customer_email" className="km-label">Email</label>
                            <input
                                id="customer_email"
                                name="customer_email"
                                type="email"
                                className="km-input"
                                placeholder="customer@email.com"
                                value={formData.customer_email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* ── Event Details ─────────────────────────── */}
                    <h3 className={styles.sectionTitle}>Event Details</h3>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label htmlFor="event_date" className="km-label">Event Date *</label>
                            <input
                                id="event_date"
                                name="event_date"
                                type="date"
                                className="km-input"
                                value={formData.event_date}
                                onChange={handleChange}
                                required
                            />
                            {dateConflict && (
                                <div className={styles.dateWarning}>
                                    <AlertTriangle size={14} />
                                    {dateConflict}
                                </div>
                            )}
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="event_type" className="km-label">Event Type</label>
                            <select
                                id="event_type"
                                name="event_type"
                                className={styles.select}
                                value={formData.event_type}
                                onChange={handleChange}
                            >
                                <option value="">Select event type</option>
                                {EVENT_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label htmlFor="guest_count" className="km-label">Expected Guests</label>
                            <input
                                id="guest_count"
                                name="guest_count"
                                type="number"
                                className="km-input"
                                placeholder="e.g., 500"
                                value={formData.guest_count}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="status" className="km-label">Booking Status</label>
                            <select
                                id="status"
                                name="status"
                                className={styles.select}
                                value={formData.status}
                                onChange={handleChange}
                            >
                                {BOOKING_STATUSES.filter((s) => s.value !== "cancelled").map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ── Payment Details ───────────────────────── */}
                    <h3 className={styles.sectionTitle}>Payment Details</h3>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label htmlFor="total_amount" className="km-label">Total Amount (₹)</label>
                            <input
                                id="total_amount"
                                name="total_amount"
                                type="number"
                                className="km-input"
                                placeholder="0.00"
                                value={formData.total_amount}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="advance_amount" className="km-label">Advance Received (₹)</label>
                            <input
                                id="advance_amount"
                                name="advance_amount"
                                type="number"
                                className="km-input"
                                placeholder="0.00"
                                value={formData.advance_amount}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* ── Notes ─────────────────────────────────── */}
                    <div className={styles.field}>
                        <label htmlFor="notes" className="km-label">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            className={styles.textarea}
                            placeholder="Special requirements, decoration preferences, catering details..."
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Actions */}
                    <div className={styles.formActions}>
                        <Link href="/dashboard/bookings" className="km-btn-outline">
                            Cancel
                        </Link>
                        <button type="submit" className={`km-btn-primary ${styles.submitBtn}`} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 size={16} className={styles.spin} /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> Save Booking
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
