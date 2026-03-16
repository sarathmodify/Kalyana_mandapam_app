import { createClient } from "@/lib/supabase/server";
import type { LedgerEntry } from "@/types/ledger";
import LedgerClient from "./LedgerClient";

export default async function LedgerPage() {
    const supabase = await createClient();

    // Fetch entries and user role in parallel — no waterfall
    const [{ data: entries }, { data: { user } }] = await Promise.all([
        supabase
            .from("ledger_entries")
            .select("*")
            .order("date", { ascending: false }),
        supabase.auth.getUser(),
    ]);

    // Get role from profiles
    let isAdmin = false;
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
        isAdmin = profile?.role === "admin";
    }

    return (
        <LedgerClient
            initialEntries={(entries as LedgerEntry[]) || []}
            isAdmin={isAdmin}
        />
    );
}
