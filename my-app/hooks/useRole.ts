"use client";

import { useAuth } from "./useAuth";
import type { UserRole } from "@/types/user";

/**
 * Hook to check the current user's role.
 * Implements Step 5 & 6 of the Auth Flow.
 *
 * Usage:
 *   const { isAdmin, isViewer, role, loading } = useRole();
 *   if (isAdmin) { // show admin buttons }
 */
export function useRole() {
    const { profile, loading } = useAuth();

    const role: UserRole | null = profile?.role ?? null;

    return {
        role,
        isAdmin: role === "admin",
        isViewer: role === "viewer",
        loading,
    };
}
