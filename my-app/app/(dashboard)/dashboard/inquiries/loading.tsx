import styles from "./inquiries.module.css";

export default function InquiriesLoading() {
    return (
        <div className={styles.page}>
            {/* Header skeleton */}
            <div style={{ marginBottom: "var(--space-6)" }}>
                <div style={{ width: 120, height: 32, background: "var(--color-border)", borderRadius: "var(--radius-md)", marginBottom: 8 }} />
                <div style={{ width: 240, height: 16, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
            </div>

            {/* Cards skeleton */}
            {[1, 2, 3].map((i) => (
                <div key={i} className="km-card" style={{ opacity: 0.5, marginBottom: "var(--space-4)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
                        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                            <div style={{ width: 120, height: 16, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                            <div style={{ width: 50, height: 20, background: "var(--color-border)", borderRadius: "var(--radius-full)" }} />
                        </div>
                        <div style={{ width: 100, height: 12, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                    </div>
                    <div style={{ width: "80%", height: 14, background: "var(--color-border)", borderRadius: "var(--radius-sm)", marginBottom: 6 }} />
                    <div style={{ width: "50%", height: 14, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                </div>
            ))}
        </div>
    );
}
