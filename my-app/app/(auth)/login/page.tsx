"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import styles from "./login.module.css";

function LoginContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get("message");
    const supabase = createClient();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError("Invalid email or password. Please try again.");
            setLoading(false);
            return;
        }

        if (data.session) {
            router.push("/dashboard");
            router.refresh();
        }
    }

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContainer}>
                {/* Left Panel — Branding */}
                <div className={styles.brandPanel}>
                    <div className={styles.brandContent}>
                        <div className={styles.brandIcon}>🏛️</div>
                        <h1>Kalyana Mandapam</h1>
                        <p>Where Dreams Meet Tradition</p>
                        <div className={styles.brandFeatures}>
                            <div className={styles.feature}>
                                <span className={styles.featureIcon}>📒</span>
                                <span>Track income & expenses</span>
                            </div>
                            <div className={styles.feature}>
                                <span className={styles.featureIcon}>📊</span>
                                <span>Financial reports & analytics</span>
                            </div>
                            <div className={styles.feature}>
                                <span className={styles.featureIcon}>👥</span>
                                <span>Staff & user management</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel — Login Form */}
                <div className={styles.formPanel}>
                    <div className={styles.formWrapper}>
                        <div className={styles.formHeader}>
                            <h2>Welcome Back</h2>
                            <p>Sign in to your staff dashboard</p>
                        </div>

                        {message && (
                            <div className={styles.successMsg}>
                                <span>✅</span> {message}
                            </div>
                        )}

                        {error && (
                            <div className={styles.errorMsg}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className={styles.form}>
                            <div className={styles.field}>
                                <label htmlFor="email" className="km-label">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className="km-input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    autoFocus
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="password" className="km-label">
                                    Password
                                </label>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className="km-input"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`km-btn-primary ${styles.submitBtn}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className={styles.spin} /> Signing in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={18} /> Sign In
                                    </>
                                )}
                            </button>
                        </form>

                        <div className={styles.footer}>
                            <p>
                                Don&apos;t have an account?{" "}
                                <Link href="/signup">Create one →</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    );
}

