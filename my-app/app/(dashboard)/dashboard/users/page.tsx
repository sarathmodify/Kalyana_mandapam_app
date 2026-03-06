import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Server-side admin guard
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        redirect("/dashboard");
    }

    // Fetch all staff profiles
    const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });

    // Use admin client (service role) to list auth users and get emails
    const adminClient = createAdminClient();
    const { data: authData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const emailMap: Record<string, string> = {};
    authData?.users?.forEach((u) => {
        emailMap[u.id] = u.email ?? "";
    });

    const staffList = (profiles ?? []).map((p) => ({
        ...p,
        email: emailMap[p.id] ?? "—",
    }));

    return <UsersClient staffList={staffList} currentUserId={user.id} />;
}
