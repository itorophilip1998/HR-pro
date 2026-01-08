'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoading(false);
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleUseDemoAccount = () => {
    setShowDemoModal(true);
  };

  const handleCopyAndSignIn = () => {
    // Copy credentials to clipboard
    const credentials = `Email: admin@hr-pro.com\nPassword: admin123`;
    navigator.clipboard.writeText(credentials);
    
    // Redirect to sign in page with credentials pre-filled (via URL params or state)
    router.push('/signin?demo=true');
    setShowDemoModal(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Hr-Pro..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl"
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
          className="absolute top-40 right-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl"
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

      <div className="max-w-4xl w-full mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Logo */}
          <motion.div
            className="inline-block mb-6"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-4xl">HP</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Hr-Pro
          </motion.h1>
          <motion.p
            className="text-2xl text-gray-700 mb-2 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Project Management Dashboard
          </motion.p>
          <motion.p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Manage your projects with ease. Track status, deadlines, team members, and budgets all in one place.
          </motion.p>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {[
            { icon: '📊', title: 'Project Tracking', desc: 'Monitor all your projects in real-time' },
            { icon: '👥', title: 'Team Management', desc: 'Assign team members and track progress' },
            { icon: '💰', title: 'Budget Control', desc: 'Keep track of project budgets and expenses' },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <motion.button
            onClick={handleUseDemoAccount}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-purple-700 to-purple-900 text-white font-bold rounded-xl shadow-2xl hover:from-purple-600 hover:to-purple-800 transition-all text-lg"
          >
            🚀 Use Demo Account
          </motion.button>
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-bold rounded-xl shadow-xl hover:from-purple-100 hover:to-pink-100 border-2 border-purple-600 transition-all text-lg"
            >
              Get Started
            </motion.button>
          </Link>
          <Link href="/signin">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:bg-gray-50 border border-gray-300 transition-all text-lg"
            >
              Sign In
            </motion.button>
          </Link>
        </motion.div>

        {/* Demo Account Info */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <p className="text-gray-600 mb-2">
            Want to try it out? Use our demo account to explore all features!
          </p>
          <button
            onClick={handleUseDemoAccount}
            className="text-purple-700 hover:text-purple-800 font-semibold underline underline-offset-2"
          >
            View Demo Account Details →
          </button>
        </motion.div>
      </div>

      {/* Demo Account Modal */}
      {showDemoModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDemoModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-200"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-white font-bold text-2xl">HP</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Demo Account</h2>
              <p className="text-gray-600">Use these credentials to sign in</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <label className="text-sm font-semibold text-purple-700 mb-1 block">Email</label>
                <div className="flex items-center justify-between">
                  <code className="text-purple-900 font-mono text-lg">admin@hr-pro.com</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('admin@hr-pro.com');
                    }}
                    className="text-purple-600 hover:text-purple-800 text-sm font-semibold"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border-2 border-pink-200">
                <label className="text-sm font-semibold text-pink-700 mb-1 block">Password</label>
                <div className="flex items-center justify-between">
                  <code className="text-pink-900 font-mono text-lg">admin123</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('admin123');
                    }}
                    className="text-pink-600 hover:text-pink-800 text-sm font-semibold"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <motion.button
                onClick={handleCopyAndSignIn}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-purple-700 to-purple-900 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-purple-800 transition-all"
              >
                📋 Copy & Sign In
              </motion.button>
              <button
                onClick={() => setShowDemoModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
