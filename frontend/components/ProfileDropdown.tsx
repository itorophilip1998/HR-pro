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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Calculate dropdown position
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 320; // w-80 = 320px
        const dropdownHeight = 300; // approximate height
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        
        let right = viewportWidth - rect.right;
        // Always try to position above the button first
        let top = rect.top - dropdownHeight - 8;
        
        // If not enough space above, try to position it higher up on the screen
        if (top < 16) {
          // Try positioning it near the top of the viewport, aligned with button's right edge
          top = Math.max(16, rect.top - dropdownHeight + rect.height);
          // If still not enough space, position below
          if (top < 16 || top + dropdownHeight > viewportHeight) {
            top = rect.bottom + 8;
          }
        }
        
        // Adjust if dropdown would go off right edge - shift it left
        if (right < 16) {
          right = viewportWidth - rect.left - dropdownWidth;
          // If still off screen, align to right edge with padding
          if (right < 16) {
            right = 16;
          }
        }
        
        // Adjust if dropdown would go off bottom edge - move it up
        if (top + dropdownHeight > viewportHeight - 16) {
          top = Math.max(16, viewportHeight - dropdownHeight - 16);
        }
        
        // Ensure minimum spacing from edges
        right = Math.max(16, Math.min(right, viewportWidth - dropdownWidth - 16));
        top = Math.max(16, Math.min(top, viewportHeight - dropdownHeight - 16));
        
        setDropdownPosition({ top, right });
      }
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
        ref={buttonRef}
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
              className="fixed inset-0"
              style={{ zIndex: 99998 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                right: `${dropdownPosition.right}px`,
                zIndex: 99999,
              }}
              className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
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

