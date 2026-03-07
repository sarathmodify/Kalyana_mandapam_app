import styles from "./ledger.module.css";

export default function LedgerLoading() {
    return (
        <div className={styles.page}>
            {/* Header skeleton */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div style={{ width: 100, height: 32, background: "var(--color-border)", borderRadius: "var(--radius-md)", marginBottom: 8 }} />
                    <div style={{ width: 200, height: 16, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                </div>
            </div>

            {/* Summary bar skeleton */}
            <div className={styles.summaryBar}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className={styles.summaryItem} style={{ opacity: 0.5 }}>
                        <div style={{ width: 40, height: 40, background: "var(--color-border)", borderRadius: "var(--radius-md)" }} />
                        <div>
                            <div style={{ width: 60, height: 12, background: "var(--color-border)", borderRadius: "var(--radius-sm)", marginBottom: 6 }} />
                            <div style={{ width: 90, height: 20, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table skeleton */}
            <div className={styles.tableCard}>
                <div className={styles.tableInfo}>
                    <div style={{ width: 160, height: 14, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                </div>
                <div style={{ padding: "var(--space-4)" }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{
                            display: "flex", gap: "var(--space-4)", padding: "var(--space-3) 0",
                            borderBottom: "1px solid var(--color-border)", alignItems: "center",
                        }}>
                            <div style={{ width: 80, height: 14, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                            <div style={{ flex: 1, height: 14, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                            <div style={{ width: 70, height: 14, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                            <div style={{ width: 90, height: 14, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                            <div style={{ width: 60, height: 22, background: "var(--color-border)", borderRadius: "var(--radius-full)" }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
