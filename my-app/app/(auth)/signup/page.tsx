"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import styles from "./signup.module.css";

export default function SignupPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push("/login?message=Account created! Please log in.");
    }

    return (
        <div className={styles.signupPage}>
            <div className={styles.signupContainer}>
                {/* Left Panel — Branding */}
                <div className={styles.brandPanel}>
                    <div className={styles.brandContent}>
                        <div className={styles.brandIcon}>🏛️</div>
                        <h1>Kalyana Mandapam</h1>
                        <p className={styles.brandSubtitle}>Staff Portal Registration</p>
                        <div className={styles.infoBox}>
                            <h3>How it works</h3>
                            <div className={styles.step}>
                                <span className={styles.stepNum}>1</span>
                                <span>Create your account here</span>
                            </div>
                            <div className={styles.step}>
                                <span className={styles.stepNum}>2</span>
                                <span>You&apos;ll start as a Viewer</span>
                            </div>
                            <div className={styles.step}>
                                <span className={styles.stepNum}>3</span>
                                <span>Admin can promote you later</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel — Signup Form */}
                <div className={styles.formPanel}>
                    <div className={styles.formWrapper}>
                        <div className={styles.formHeader}>
                            <h2>Create Account</h2>
                            <p>Register as a new staff member</p>
                        </div>

                        {error && (
                            <div className={styles.errorMsg}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSignup} className={styles.form}>
                            <div className={styles.field}>
                                <label htmlFor="fullName" className="km-label">
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    className="km-input"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

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
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
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
                                        <Loader2 size={18} className={styles.spin} /> Creating
                                        account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={18} /> Create Account
                                    </>
                                )}
                            </button>
                        </form>

                        <div className={styles.footer}>
                            <p>
                                Already have an account?{" "}
                                <Link href="/login">Sign in →</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
