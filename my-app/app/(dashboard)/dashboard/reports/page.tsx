import { createClient } from "@/lib/supabase/server";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
    const supabase = await createClient();

    // Fetch all entries and user role in parallel
    const [{ data: entries }, { data: { user } }] = await Promise.all([
        supabase
            .from("ledger_entries")
            .select("*")
            .order("date", { ascending: true }),
        supabase.auth.getUser(),
    ]);

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
        <ReportsClient
            initialEntries={entries || []}
            isAdmin={isAdmin}
        />
    );
}
