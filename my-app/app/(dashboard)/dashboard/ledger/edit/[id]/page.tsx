"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import { LEDGER_CATEGORIES, PAYMENT_METHODS } from "@/constants";
import type { LedgerType, PaymentMethod, LedgerEntry } from "@/types/ledger";
import Link from "next/link";
import {
    ArrowLeft,
    Save,
    Loader2,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import styles from "../../form.module.css";

export default function EditLedgerEntryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { isAdmin, loading: roleLoading } = useRole();
    const { user } = useAuth();
    const supabase = createClient();

    const [formData, setFormData] = useState({
        date: "",
        description: "",
        amount: "",
        type: "income" as LedgerType,
        category: "",
        payment_method: "" as PaymentMethod | "",
        reference_no: "",
        booking_id: "",
        notes: "",
    });

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [loadingEntry, setLoadingEntry] = useState(true);
    const [bookings, setBookings] = useState<{ id: string; customer_name: string; event_date: string }[]>([]);

    // Fetch existing entry
    useEffect(() => {
        async function fetchEntry() {
            const { data, error } = await supabase
                .from("ledger_entries")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                router.push("/dashboard/ledger");
                return;
            }

            const entry = data as LedgerEntry;
            setFormData({
                date: entry.date,
                description: entry.description,
                amount: String(entry.amount),
                type: entry.type,
                category: entry.category || "",
                payment_method: (entry.payment_method || "") as PaymentMethod | "",
                reference_no: entry.reference_no || "",
                booking_id: entry.booking_id || "",
                notes: entry.notes || "",
            });
            setLoadingEntry(false);
        }
        fetchEntry();
    }, [id]);

    // Fetch bookings for dropdown
    useEffect(() => {
        async function fetchBookings() {
            const { data } = await supabase
                .from("bookings")
                .select("id, customer_name, event_date")
                .order("event_date", { ascending: false });
            if (data) setBookings(data);
        }
        fetchBookings();
    }, []);

    // Redirect non-admins
    useEffect(() => {
        if (!roleLoading && !isAdmin) {
            router.push("/dashboard/ledger");
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

        if (!formData.description.trim()) {
            setError("Description is required.");
            setSaving(false);
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            setError("Amount must be a positive number.");
            setSaving(false);
            return;
        }

        const { error: updateError } = await supabase
            .from("ledger_entries")
            .update({
                date: formData.date,
                description: formData.description.trim(),
                amount: Number(formData.amount),
                type: formData.type,
                category: formData.category || null,
                payment_method: formData.payment_method || null,
                reference_no: formData.reference_no || null,
                booking_id: formData.booking_id || null,
                notes: formData.notes || null,
                updated_by: user?.id,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (updateError) {
            setError(updateError.message);
            setSaving(false);
            return;
        }

        router.push("/dashboard/ledger");
    };

    if (roleLoading || loadingEntry) {
        return (
            <div className={styles.page} style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                <Loader2 size={28} className={styles.spin} color="#1E40AF" />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Link href="/dashboard/ledger" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Ledger
            </Link>

            <div className={styles.header}>
                <h2>Edit Ledger Entry</h2>
                <p>Update transaction details</p>
            </div>

            <div className={styles.card}>
                {error && (
                    <div className={styles.error}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Type Toggle */}
                    <div className={styles.field}>
                        <label className="km-label">Transaction Type</label>
                        <div className={styles.typeToggle}>
                            <button
                                type="button"
                                className={`${styles.typeOption} ${formData.type === "income" ? styles.typeIncome : ""}`}
                                onClick={() => setFormData((p) => ({ ...p, type: "income" }))}
                            >
                                <TrendingUp size={16} /> Income
                            </button>
                            <button
                                type="button"
                                className={`${styles.typeOption} ${formData.type === "expense" ? styles.typeExpense : ""}`}
                                onClick={() => setFormData((p) => ({ ...p, type: "expense" }))}
                            >
                                <TrendingDown size={16} /> Expense
                            </button>
                        </div>
                    </div>

                    {/* Date & Amount */}
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label htmlFor="date" className="km-label">Date *</label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                className="km-input"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="amount" className="km-label">Amount (₹) *</label>
                            <input
                                id="amount"
                                name="amount"
                                type="number"
                                className="km-input"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleChange}
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className={styles.field}>
                        <label htmlFor="description" className="km-label">Description *</label>
                        <input
                            id="description"
                            name="description"
                            type="text"
                            className="km-input"
                            placeholder="e.g., Hall booking payment from Mr. Kumar"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Category & Payment Method */}
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label htmlFor="category" className="km-label">Category</label>
                            <select
                                id="category"
                                name="category"
                                className={styles.select}
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Select category</option>
                                {LEDGER_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="payment_method" className="km-label">Payment Method</label>
                            <select
                                id="payment_method"
                                name="payment_method"
                                className={styles.select}
                                value={formData.payment_method}
                                onChange={handleChange}
                            >
                                <option value="">Select method</option>
                                {PAYMENT_METHODS.map((pm) => (
                                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Reference No & Booking Link */}
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label htmlFor="reference_no" className="km-label">Reference No.</label>
                            <input
                                id="reference_no"
                                name="reference_no"
                                type="text"
                                className="km-input"
                                placeholder="e.g., TXN-12345"
                                value={formData.reference_no}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="booking_id" className="km-label">Link to Booking</label>
                            <select
                                id="booking_id"
                                name="booking_id"
                                className={styles.select}
                                value={formData.booking_id}
                                onChange={handleChange}
                            >
                                <option value="">No linked booking</option>
                                {bookings.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.customer_name} — {b.event_date}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className={styles.field}>
                        <label htmlFor="notes" className="km-label">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            className={styles.textarea}
                            placeholder="Any additional details..."
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Actions */}
                    <div className={styles.formActions}>
                        <Link href="/dashboard/ledger" className="km-btn-outline">
                            Cancel
                        </Link>
                        <button type="submit" className={`km-btn-primary ${styles.submitBtn}`} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 size={16} className={styles.spin} /> Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> Update Entry
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
