'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaKeyboard, FaEnvelope, FaIdCard } from 'react-icons/fa';

interface User {
  id: string;
  email: string;
  name: string;
}

interface ProfileDropdownProps {
  user: User | null;
  onShowShortcuts: () => void;
}

export default function ProfileDropdown({ user, onShowShortcuts }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/signin');
  };

  const handleShortcuts = () => {
    setIsOpen(false);
    onShowShortcuts();
  };

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full relative"
      >
        <div className="w-14 h-14 bg-gradient-to-br from-purple-700 to-purple-900 rounded-full flex items-center justify-center shadow-xl border-2 border-white relative">
          <span className="text-white font-bold text-xl">{initials}</span>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-purple-700">
            <svg
              className={`w-3 h-3 text-purple-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden"
            >
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-purple-700 to-purple-900 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                    <span className="text-white font-bold text-xl">{initials}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{user.name}</h3>
                    <p className="text-white/90 text-sm flex items-center gap-2 mt-1">
                      <FaEnvelope className="w-3 h-3" />
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3 text-gray-700">
                  <FaIdCard className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-sm font-semibold">{user.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <motion.button
                  onClick={handleShortcuts}
                  whileHover={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <FaKeyboard className="w-4 h-4" />
                  <span className="font-medium">Keyboard Shortcuts</span>
                  <span className="ml-auto text-xs text-gray-400">Ctrl/Cmd + /</span>
                </motion.button>

                <motion.button
                  onClick={handleLogout}
                  whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

