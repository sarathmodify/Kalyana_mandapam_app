export type UserRole = "admin" | "viewer";

export interface Profile {
    id: string;
    full_name?: string;
    role: UserRole;
    phone?: string;
    created_at: string;
    updated_at: string;
}
