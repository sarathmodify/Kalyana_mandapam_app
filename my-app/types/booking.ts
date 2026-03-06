export type BookingStatus = "confirmed" | "tentative" | "cancelled";

export interface Booking {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    event_date: string;
    event_type?: string;
    hall_section?: string;
    guest_count?: number;
    advance_amount: number;
    total_amount?: number;
    status: BookingStatus;
    notes?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}
