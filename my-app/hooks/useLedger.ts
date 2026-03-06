"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LedgerEntry } from "@/types/ledger";

interface UseLedgerReturn {
    entries: LedgerEntry[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    addEntry: (entry: Omit<LedgerEntry, "id" | "created_at" | "updated_at">) => Promise<{ success: boolean; error?: string }>;
    updateEntry: (id: string, updates: Partial<LedgerEntry>) => Promise<{ success: boolean; error?: string }>;
    deleteEntry: (id: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Hook for Ledger CRUD operations.
 */
export function useLedger(): UseLedgerReturn {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
            .from("ledger_entries")
            .select("*")
            .order("date", { ascending: false })
            .order("created_at", { ascending: false });

        if (fetchError) {
            setError(fetchError.message);
            setEntries([]);
        } else {
            setEntries((data as LedgerEntry[]) || []);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const addEntry = async (
        entry: Omit<LedgerEntry, "id" | "created_at" | "updated_at">
    ) => {
        const { error: insertError } = await supabase
            .from("ledger_entries")
            .insert(entry);

        if (insertError) {
            return { success: false, error: insertError.message };
        }

        await fetchEntries();
        return { success: true };
    };

    const updateEntry = async (id: string, updates: Partial<LedgerEntry>) => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { error: updateError } = await supabase
            .from("ledger_entries")
            .update({
                ...updates,
                updated_by: user?.id,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        await fetchEntries();
        return { success: true };
    };

    const deleteEntry = async (id: string) => {
        const { error: deleteError } = await supabase
            .from("ledger_entries")
            .delete()
            .eq("id", id);

        if (deleteError) {
            return { success: false, error: deleteError.message };
        }

        await fetchEntries();
        return { success: true };
    };

    return {
        entries,
        loading,
        error,
        refetch: fetchEntries,
        addEntry,
        updateEntry,
        deleteEntry,
    };
}
