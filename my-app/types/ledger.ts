export type LedgerType = "income" | "expense";
export type PaymentMethod = "cash" | "bank_transfer" | "upi" | "cheque" | "other";

export type LedgerPaymentStatus = "regular" | "advance_pending" | "completed";

export interface LedgerEntry {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: LedgerType;
    category?: string;
    payment_method?: PaymentMethod;
    reference_no?: string;
    notes?: string;
    payment_status?: LedgerPaymentStatus;
    total_event_amount?: number;
    parent_entry_id?: string;
    calculated_total_paid?: number;
    calculated_pending_amount?: number;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface LedgerAuditLog {
    id: string;
    entry_id: string;
    action: "create" | "update" | "delete";
    changed_by?: string;
    changed_at: string;
    old_data?: Record<string, unknown>;
    new_data?: Record<string, unknown>;
}
