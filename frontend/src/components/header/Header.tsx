"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Menu, Wallet, X } from "lucide-react";

import styles from "./Header.module.css";

interface User {
  name: string;
  email: string;
}

interface ProfileResponse {
  user: User;
  message?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Header = () => {
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "Security", href: "/#security" },
    { label: "About", href: "/#about" },
  ];

  useEffect(() => {
    let isActive = true;

    const getCurrentUser = async () => {
      try {
        if (!API_URL) {
          throw new Error("API URL is not configured.");
        }

        const response = await axios.get<ProfileResponse>(
          `${API_URL}/api/auth/profile`,
          {
            withCredentials: true,
          },
        );

        if (!isActive) return;

        setUser(response.data.user);
      } catch (error: unknown) {
        if (!isActive) return;

        setUser(null);

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            return;
          }

          if (error.response) {
            toast.error(
              error.response.data?.message ||
                "Unable to fetch your profile. Please try again.",
            );
          } else {
            toast.error(
              "Unable to connect to the server. Please check your connection.",
            );
          }
        } else {
          toast.error("Something went wrong while checking your account.");
        }
      } finally {
        if (isActive) {
          setIsCheckingAuth(false);
        }
      }
    };

    getCurrentUser();

    return () => {
      isActive = false;
    };
  }, [pathname]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <motion.header
      className={styles.header}
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <motion.span
            className={styles.logoIcon}
            whileHover={{ rotate: -8, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Wallet size={23} strokeWidth={2.2} />
          </motion.span>

          <span className={styles.logoText}>
            bankly<span>.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className={styles.desktopActions}>
          {!isCheckingAuth &&
            (user ? (
              <Link href="/profile" className={styles.profileLink}>
                <span className={styles.avatar}>
                  {user.name.charAt(0).toUpperCase()}
                </span>

                <span className={styles.userName}>{user.name}</span>

                <ChevronDown size={16} />
              </Link>
            ) : (
              <>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
                  <Link href="/login" className={styles.loginButton}>
                    Login
                  </Link>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
                  <Link href="/register" className={styles.registerButton}>
                    Get Started
                    <ArrowUpRight size={17} />
                  </Link>
                </motion.div>
              </>
            ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isMenuOpen ? "close" : "open"}
              initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
              transition={{ duration: 0.18 }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-navigation"
            className={styles.mobilePanel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <div className={styles.mobileContent}>
              <nav className={styles.mobileNav}>
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={styles.mobileNavLink}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className={styles.mobileActions}>
                {!isCheckingAuth &&
                  (user ? (
                    <Link
                      href="/profile"
                      className={styles.mobileProfile}
                      onClick={closeMenu}
                    >
                      <span className={styles.avatar}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>

                      <span>{user.name}</span>

                      <ArrowUpRight size={17} />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className={styles.mobileLogin}
                        onClick={closeMenu}
                      >
                        Login
                      </Link>

                      <Link
                        href="/register"
                        className={styles.mobileRegister}
                        onClick={closeMenu}
                      >
                        Get Started
                        <ArrowUpRight size={17} />
                      </Link>
                    </>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
