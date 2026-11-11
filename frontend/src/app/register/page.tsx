"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import styles from "./Register.module.css";

interface RegisterResponse {
  message?: string;
  createdUser?: {
    name: string;
    email: string;
  };
}

interface ErrorResponse {
  message?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const RegisterPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!API_URL) {
      toast.error("API URL is not configured.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post<RegisterResponse>(
        `${API_URL}/api/auth/register`,
        {
          name,
          email,
          password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      toast.success(response.data.message || "Account created successfully!");

      router.replace("/");
      router.refresh();
    } catch (err: unknown) {
      if (axios.isAxiosError<ErrorResponse>(err)) {
        if (err.response) {
          toast.error(
            err.response.data?.message ||
              "Registration failed. Please try again.",
          );
        } else {
          toast.error(
            "Unable to connect to the server. Please check your connection.",
          );
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <motion.section
          className={styles.visualPanel}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/" className={styles.brand}>
            <span className={styles.brandIcon}>
              <Wallet size={22} strokeWidth={2.2} />
            </span>
            bankly<span>.</span>
          </Link>

          <div className={styles.visualContent}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              YOUR FINANCIAL SPACE
            </span>

            <h1>
              Banking that
              <br />
              moves with <span>you.</span>
            </h1>

            <p>
              Take control of your finances with a simpler, clearer way to
              manage your money.
            </p>

            <div className={styles.featureList}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <ShieldCheck size={19} />
                </span>
                <div>
                  <strong>Security first</strong>
                  <span>Your account, protected.</span>
                </div>
              </div>

              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <LockKeyhole size={19} />
                </span>
                <div>
                  <strong>Simple money management</strong>
                  <span>Everything in one place.</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.visualFooter}>
            <span>Banking made straightforward.</span>
            <span>© 2026 Bankly</span>
          </div>
        </motion.section>

        <motion.section
          className={styles.formPanel}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className={styles.formWrapper}>
            <div className={styles.mobileBrand}>
              <Link href="/" className={styles.brand}>
                <span className={styles.brandIcon}>
                  <Wallet size={21} />
                </span>
                bankly<span>.</span>
              </Link>
            </div>

            <div className={styles.formHeading}>
              <span className={styles.formEyebrow}>GET STARTED</span>
              <h2>Create your account</h2>
              <p>Enter your details to get started with Bankly.</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. John Smith"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="password">Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="confirmPassword">Confirm password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner} />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className={styles.loginText}>
              Already have an account? <Link href="/login">Log in</Link>
            </p>

            <div className={styles.securityNote}>
              <ShieldCheck size={16} />
              <span>Your information is handled securely.</span>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
};

export default RegisterPage;
