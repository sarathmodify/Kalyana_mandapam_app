import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely — handles conflicts and conditionals.
 * Usage: cn("text-red-500", isActive && "bg-blue-100")
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupees (₹).
 * Example: formatCurrency(50000) → "₹50,000.00"
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format a date string to a human-readable format.
 * Example: formatDate("2026-03-15") → "15 Mar 2026"
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

/**
 * Format a date-time string with time included.
 * Example: formatDateTime("2026-03-15T10:30:00") → "15 Mar 2026, 10:30 AM"
 */
export function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

/**
 * Truncate long text with ellipsis.
 */
export function truncate(text: string, length: number = 50): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + "…";
}

/**
 * Export an array of objects as a CSV file download.
 */
export function exportToCSV(
    data: Record<string, unknown>[],
    filename: string
): void {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
        Object.values(row)
            .map((val) => {
                const str = String(val ?? "");
                return str.includes(",") ? `"${str}"` : str;
            })
            .join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
