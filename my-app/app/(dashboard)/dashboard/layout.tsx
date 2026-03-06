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

    // STEP 5: App checks role from profiles table
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    console.log(profile, "profilerole");

    // STEP 6: Pass role down — sidebar and components react to it
    return (
        <DashboardShell
            userRole={profile?.role}
            userName={profile?.full_name || user.email?.split("@")[0] || "User"}
        >
            {children}
        </DashboardShell>
    );
}
