export default function DashboardLoading() {
    return (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Header skeleton */}
            <div style={{ marginBottom: "var(--space-6)" }}>
                <div style={{ width: 180, height: 32, background: "var(--color-border)", borderRadius: "var(--radius-md)", marginBottom: 8 }} />
                <div style={{ width: 280, height: 16, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
            </div>

            {/* Stat cards skeleton */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-5)", marginBottom: "var(--space-8)" }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="km-stat-card" style={{ opacity: 0.5 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                            <div style={{ width: 80, height: 12, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                            <div style={{ width: 36, height: 36, background: "var(--color-border)", borderRadius: "var(--radius-md)" }} />
                        </div>
                        <div style={{ width: 100, height: 28, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                    </div>
                ))}
            </div>

            {/* Recent entries skeleton */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
                {[1, 2].map((i) => (
                    <div key={i} className="km-card" style={{ opacity: 0.5 }}>
                        <div style={{ width: 140, height: 20, background: "var(--color-border)", borderRadius: "var(--radius-sm)", marginBottom: "var(--space-5)" }} />
                        {[1, 2, 3].map((j) => (
                            <div key={j} style={{
                                display: "flex", justifyContent: "space-between", padding: "var(--space-3) 0",
                                borderBottom: "1px solid var(--color-border)",
                            }}>
                                <div style={{ width: "60%", height: 14, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                                <div style={{ width: 70, height: 14, background: "var(--color-border)", borderRadius: "var(--radius-sm)" }} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
