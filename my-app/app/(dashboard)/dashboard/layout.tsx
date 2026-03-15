import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();


    if (!user) redirect("/login");

    // Fetch user profile for role-based access
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <DashboardShell
            userRole={profile?.role}
            userName={profile?.full_name || user.email?.split("@")[0] || "User"}
        >
            {children}
        </DashboardShell>
    );
}
