"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/user";

interface AuthState {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
}

/**
 * Hook to get the current authenticated user and their profile.
 * Automatically subscribes to auth state changes.
 */
export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        loading: true,
    });

    useEffect(() => {
        const supabase = createClient();

        // Get initial session
        const getInitialSession = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                setState({ user, profile: profile as Profile, loading: false });
            } else {
                setState({ user: null, profile: null, loading: false });
            }
        };

        getInitialSession();

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                setState({
                    user: session.user,
                    profile: profile as Profile,
                    loading: false,
                });
            } else {
                setState({ user: null, profile: null, loading: false });
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return state;
}
