import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/user";

/**
 * Get the current user session and profile data.
 * For use in client components.
 */
export async function getCurrentUser() {
    const supabase = createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return { user: null, profile: null };
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profileError) {
        return { user, profile: null };
    }

    return { user, profile: profile as Profile };
}

/**
 * Sign out the current user and redirect to login.
 */
export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
}
