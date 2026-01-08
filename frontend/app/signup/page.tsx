"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup, signin } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    // Calculate password strength
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 6) strength += 1;
      if (formData.password.length >= 8) strength += 1;
      if (/[A-Z]/.test(formData.password)) strength += 1;
      if (/[0-9]/.test(formData.password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await signup(formData);
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Signup failed:", error);
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        if (err.response?.data?.message) {
          setErrors({ submit: err.response.data.message });
        } else {
          setErrors({ submit: "Signup failed. Please try again." });
        }
      } else {
        setErrors({ submit: "Signup failed. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setErrors({}); // Clear any previous errors
    try {
      const response = await signin({
        email: "admin@hr-pro.com",
        password: "admin123",
      });
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Demo login failed:", error);
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { message?: string }; status?: number } };
        if (err.response?.status === 401) {
          setErrors({ 
            submit: "Demo account not found. Please make sure the application has been started and the database has been seeded." 
          });
        } else if (err.response?.data?.message) {
          setErrors({ submit: err.response.data.message });
        } else {
          setErrors({ submit: "Failed to sign in with demo account. Please try again." });
        }
      } else {
        setErrors({ submit: "Failed to sign in with demo account. Please check your connection and try again." });
      }
      setIsDemoLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="max-w-md w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8 text-center">
          <motion.div
            className="inline-block mb-4"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-glow">
              <span className="text-white font-bold text-2xl">HP</span>
            </div>
          </motion.div>
          <motion.h1
            className="text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Join Hr-Pro
          </motion.h1>
          <motion.p
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Create your account and start managing projects
          </motion.p>
          <motion.p
            className="text-gray-500 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            You can also use a demo account to explore the app
          </motion.p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <motion.div variants={itemVariants}>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Full Name
              </label>
              <motion.input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                whileFocus={{ scale: 1.02 }}
                className={`w-full px-5 py-4 text-base rounded-xl bg-gray-50 border ${
                  errors.name
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-purple-600"
                } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 font-medium"
                >
                  {errors.name}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email address
              </label>
              <motion.input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                whileFocus={{ scale: 1.02 }}
                className={`w-full px-5 py-4 text-base rounded-xl bg-gray-50 border ${
                  errors.email
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-purple-600"
                } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 font-medium"
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <motion.input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  whileFocus={{ scale: 1.02 }}
                  className={`w-full px-5 py-4 pr-12 text-base rounded-xl bg-gray-50 border ${
                    errors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-purple-600"
                  } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L3 12m3.29-5.71L12 12m-5.71 0L12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2"
                >
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= passwordStrength
                            ? getPasswordStrengthColor()
                            : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {passwordStrength <= 2
                      ? "Weak password"
                      : passwordStrength <= 3
                      ? "Medium strength"
                      : "Strong password"}
                  </p>
                </motion.div>
              )}
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 font-medium"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl bg-red-50 border border-red-200 p-4"
              >
                <p className="text-sm text-red-700 font-medium">
                  {errors.submit}
                </p>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex justify-center items-center py-4 px-6 text-base font-bold rounded-xl text-white bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl transform transition-all duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creating account...</span>
                  </span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <svg
                      className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or</span>
              </div>
            </div>
          </motion.div>

          {/* Demo Account Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              onClick={handleDemoLogin}
              disabled={isDemoLoading || isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex justify-center items-center py-4 px-6 text-base font-bold rounded-xl text-white bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transform transition-all duration-200"
            >
              {isDemoLoading ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Signing in with demo...</span>
                </span>
              ) : (
                <>
                  <span>🚀 Continue with Demo Account</span>
                </>
              )}
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-bold text-purple-700 hover:text-purple-800 underline-offset-2 hover:underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
