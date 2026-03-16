"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import { LEDGER_CATEGORIES, PAYMENT_METHODS } from "@/constants";
import type { LedgerType, PaymentMethod, LedgerPaymentStatus } from "@/types/ledger";
import Link from "next/link";
import {
    ArrowLeft,
    Save,
    Loader2,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import styles from "../form.module.css";

export default function AddLedgerEntryPage() {
    const router = useRouter();
    const { isAdmin, loading: roleLoading } = useRole();
    const { user } = useAuth();
    const supabase = createClient();

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        type: "income" as LedgerType,
        category: "",
        payment_method: "" as PaymentMethod | "",
        reference_no: "",
        notes: "",
    });

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

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

        const finalAmount = Number(formData.amount);
        const finalTotalEventAmount = isAdvance ? Number(totalEventAmount) : null;
        const finalAdvanceAmount = isAdvance ? finalAmount : null;
        const finalPendingAmount = isAdvance ? finalTotalEventAmount! - finalAdvanceAmount! : null;
        const finalPaymentStatus = isAdvance ? "advance_pending" : "regular";

        if (isAdvance && (!totalEventAmount || Number(totalEventAmount) <= 0)) {
            setError("Total Event Amount is required for advance payments.");
            setSaving(false);
            return;
        }

        if (isAdvance && finalAmount >= Number(totalEventAmount)) {
            setError("Advance amount must be less than Total Event Amount.");
            setSaving(false);
            return;
        }

        const { error: insertError } = await supabase
            .from("ledger_entries")
            .insert({
                date: formData.date,
                description: formData.description.trim(),
                amount: finalAmount,
                type: formData.type,
                category: formData.category || null,
                payment_method: formData.payment_method || null,
                reference_no: formData.reference_no || null,
                notes: formData.notes || null,
                payment_status: finalPaymentStatus,
                total_event_amount: finalTotalEventAmount,
                advance_amount: finalAdvanceAmount,
                pending_amount: finalPendingAmount,
                created_by: user?.id,
                updated_by: user?.id,
            });

        if (insertError) {
            setError(insertError.message);
            setSaving(false);
            return;
        }

        router.push("/dashboard/ledger");
    };

    if (roleLoading) {
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
                <h2>Add Ledger Entry</h2>
                <p>Record a new income or expense transaction</p>
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

                    {/* Advance Payment Toggle */}
                    {formData.type === "income" && (
                        <div className={styles.field}>
                            <label className="km-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                                <input
                                    type="checkbox"
                                    checked={isAdvance}
                                    onChange={(e) => setIsAdvance(e.target.checked)}
                                />
                                Is this an Event Advance Payment?
                            </label>
                        </div>
                    )}

                    {/* Date & Amount */}
                    {isAdvance ? (
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
                                <label htmlFor="totalEventAmount" className="km-label">Total Event Amount (₹) *</label>
                                <input
                                    id="totalEventAmount"
                                    type="number"
                                    className="km-input"
                                    placeholder="0.00"
                                    value={totalEventAmount}
                                    onChange={(e) => setTotalEventAmount(e.target.value)}
                                    min="0.01"
                                    step="0.01"
                                    required={isAdvance}
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="amount" className="km-label">Advance Received (₹) *</label>
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
                    ) : (
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
                    )}

                    {isAdvance && totalEventAmount && formData.amount && (
                        <div className={styles.field} style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd', marginBottom: '16px' }}>
                            <p style={{ margin: 0, color: '#0369a1', fontSize: '14px' }}>
                                <strong>Pending Balance:</strong> ₹{Math.max(0, Number(totalEventAmount) - Number(formData.amount)).toFixed(2)}
                            </p>
                        </div>
                    )}

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

                    {/* Reference No */}
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
                                    <Loader2 size={16} className={styles.spin} /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> Save Entry
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
