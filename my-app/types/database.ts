// ═══════════════════════════════════════════════════════════════
// KALYANA MANDAPAM — Supabase Database Types
// Manually typed to match the Supabase schema.
// To auto-generate: npx supabase gen types typescript --project-id <your-ref> > types/database.ts
// ═══════════════════════════════════════════════════════════════

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    full_name: string | null;
                    role: "admin" | "viewer";
                    phone: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    full_name?: string | null;
                    role?: "admin" | "viewer";
                    phone?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string | null;
                    role?: "admin" | "viewer";
                    phone?: string | null;
                    updated_at?: string;
                };
            };
            bookings: {
                Row: {
                    id: string;
                    customer_name: string;
                    customer_phone: string;
                    customer_email: string | null;
                    event_date: string;
                    event_type: string | null;
                    hall_section: string | null;
                    guest_count: number | null;
                    advance_amount: number;
                    total_amount: number | null;
                    status: "confirmed" | "tentative" | "cancelled";
                    notes: string | null;
                    created_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    customer_name: string;
                    customer_phone: string;
                    customer_email?: string | null;
                    event_date: string;
                    event_type?: string | null;
                    hall_section?: string | null;
                    guest_count?: number | null;
                    advance_amount?: number;
                    total_amount?: number | null;
                    status?: "confirmed" | "tentative" | "cancelled";
                    notes?: string | null;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    customer_name?: string;
                    customer_phone?: string;
                    customer_email?: string | null;
                    event_date?: string;
                    event_type?: string | null;
                    hall_section?: string | null;
                    guest_count?: number | null;
                    advance_amount?: number;
                    total_amount?: number | null;
                    status?: "confirmed" | "tentative" | "cancelled";
                    notes?: string | null;
                    updated_at?: string;
                };
            };
            ledger_entries: {
                Row: {
                    id: string;
                    date: string;
                    description: string;
                    amount: number;
                    type: "income" | "expense";
                    category: string | null;
                    payment_method: "cash" | "bank_transfer" | "upi" | "cheque" | "other" | null;
                    reference_no: string | null;
                    booking_id: string | null;
                    notes: string | null;
                    created_by: string | null;
                    updated_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    date: string;
                    description: string;
                    amount: number;
                    type: "income" | "expense";
                    category?: string | null;
                    payment_method?: "cash" | "bank_transfer" | "upi" | "cheque" | "other" | null;
                    reference_no?: string | null;
                    booking_id?: string | null;
                    notes?: string | null;
                    created_by?: string | null;
                    updated_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    date?: string;
                    description?: string;
                    amount?: number;
                    type?: "income" | "expense";
                    category?: string | null;
                    payment_method?: "cash" | "bank_transfer" | "upi" | "cheque" | "other" | null;
                    reference_no?: string | null;
                    booking_id?: string | null;
                    notes?: string | null;
                    updated_by?: string | null;
                    updated_at?: string;
                };
            };
            gallery_images: {
                Row: {
                    id: string;
                    title: string | null;
                    storage_path: string;
                    is_featured: boolean;
                    sort_order: number;
                    uploaded_by: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title?: string | null;
                    storage_path: string;
                    is_featured?: boolean;
                    sort_order?: number;
                    uploaded_by?: string | null;
                    created_at?: string;
                };
                Update: {
                    title?: string | null;
                    storage_path?: string;
                    is_featured?: boolean;
                    sort_order?: number;
                };
            };
            contact_inquiries: {
                Row: {
                    id: string;
                    name: string;
                    phone: string | null;
                    email: string | null;
                    event_date: string | null;
                    message: string | null;
                    status: "new" | "read" | "replied";
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    phone?: string | null;
                    email?: string | null;
                    event_date?: string | null;
                    message?: string | null;
                    status?: "new" | "read" | "replied";
                    created_at?: string;
                };
                Update: {
                    name?: string;
                    phone?: string | null;
                    email?: string | null;
                    event_date?: string | null;
                    message?: string | null;
                    status?: "new" | "read" | "replied";
                };
            };
            ledger_audit_log: {
                Row: {
                    id: string;
                    entry_id: string;
                    action: "create" | "update" | "delete";
                    changed_by: string | null;
                    changed_at: string;
                    old_data: Json | null;
                    new_data: Json | null;
                };
                Insert: {
                    id?: string;
                    entry_id: string;
                    action: "create" | "update" | "delete";
                    changed_by?: string | null;
                    changed_at?: string;
                    old_data?: Json | null;
                    new_data?: Json | null;
                };
                Update: {
                    // Audit log should not be manually updated
                };
            };
        };
        Views: {
            ledger_with_balance: {
                Row: {
                    id: string;
                    date: string;
                    description: string;
                    amount: number;
                    type: "income" | "expense";
                    category: string | null;
                    payment_method: "cash" | "bank_transfer" | "upi" | "cheque" | "other" | null;
                    reference_no: string | null;
                    booking_id: string | null;
                    notes: string | null;
                    created_by: string | null;
                    updated_by: string | null;
                    created_at: string;
                    updated_at: string;
                    running_balance: number;
                };
            };
        };
        Functions: {
            get_my_role: {
                Args: Record<string, never>;
                Returns: string;
            };
        };
    };
}
