"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/types/booking";

interface UseBookingsReturn {
    bookings: Booking[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    addBooking: (booking: Omit<Booking, "id" | "created_at" | "updated_at">) => Promise<{ success: boolean; error?: string }>;
    updateBooking: (id: string, updates: Partial<Booking>) => Promise<{ success: boolean; error?: string }>;
    deleteBooking: (id: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Hook for Bookings CRUD operations.
 */
export function useBookings(): UseBookingsReturn {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
            .from("bookings")
            .select("*")
            .order("event_date", { ascending: true });

        if (fetchError) {
            setError(fetchError.message);
            setBookings([]);
        } else {
            setBookings((data as Booking[]) || []);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const addBooking = async (
        booking: Omit<Booking, "id" | "created_at" | "updated_at">
    ) => {
        const { error: insertError } = await supabase
            .from("bookings")
            .insert(booking);

        if (insertError) {
            return { success: false, error: insertError.message };
        }

        await fetchBookings();
        return { success: true };
    };

    const updateBooking = async (id: string, updates: Partial<Booking>) => {
        const { error: updateError } = await supabase
            .from("bookings")
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        await fetchBookings();
        return { success: true };
    };

    const deleteBooking = async (id: string) => {
        const { error: deleteError } = await supabase
            .from("bookings")
            .delete()
            .eq("id", id);

        if (deleteError) {
            return { success: false, error: deleteError.message };
        }

        await fetchBookings();
        return { success: true };
    };

    return {
        bookings,
        loading,
        error,
        refetch: fetchBookings,
        addBooking,
        updateBooking,
        deleteBooking,
    };
}
