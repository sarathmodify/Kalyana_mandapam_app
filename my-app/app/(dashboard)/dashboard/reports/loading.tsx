import styles from "./reports.module.css";

export default function ReportsLoading() {
    return (
        <div className={styles.page}>
            {/* Header skeleton */}
            <div style={{ marginBottom: "var(--space-6)" }}>
                <div style={{ width: 100, height: 32, background: "var(--color-border)", borderRadius: "var(--radius-md)", marginBottom: 8 }} />
                <div style={{ width: 260, height: 16, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
            </div>

            {/* Chart skeleton */}
            <div className="km-card" style={{ opacity: 0.5, marginBottom: "var(--space-6)" }}>
                <div style={{ width: 200, height: 20, background: "var(--color-border)", borderRadius: "var(--radius-sm)", marginBottom: "var(--space-6)" }} />
                <div style={{ width: "100%", height: 300, background: "var(--color-border)", borderRadius: "var(--radius-md)" }} />
            </div>

            {/* Table skeleton */}
            <div className="km-card" style={{ opacity: 0.5 }}>
                <div style={{ width: 180, height: 20, background: "var(--color-border)", borderRadius: "var(--radius-sm)", marginBottom: "var(--space-6)" }} />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{
                        display: "flex", gap: "var(--space-4)", padding: "var(--space-3) 0",
                        borderBottom: "1px solid var(--color-border)", alignItems: "center",
                    }}>
                        <div style={{ width: 80, height: 14, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                        <div style={{ flex: 1, height: 14, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                        <div style={{ width: 90, height: 14, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                        <div style={{ width: 90, height: 14, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
