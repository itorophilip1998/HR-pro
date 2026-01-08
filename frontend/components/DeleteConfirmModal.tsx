'use client';

import LoadingSpinner from './LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName?: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass backdrop-blur-xl bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-3xl shadow-2xl max-w-md w-full mx-4 border-2 border-purple-500"
        >
          <div className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-rose-700 rounded-full mb-6 shadow-xl"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black text-white text-center mb-3"
            >
              Delete Project
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base text-white font-medium text-center mb-8 leading-relaxed"
            >
              Are you sure you want to delete{' '}
              {projectName && <span className="font-black text-white">&quot;{projectName}&quot;</span>}?
              <br />
              <span className="text-red-300 font-bold mt-2 block">This action cannot be undone.</span>
            </motion.p>

            <div className="flex justify-end space-x-4">
              <motion.button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 border-2 border-purple-400 rounded-xl text-white bg-transparent hover:bg-purple-800/50 disabled:opacity-50 font-bold shadow-lg transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                whileHover={{ scale: isDeleting ? 1 : 1.05 }}
                whileTap={{ scale: isDeleting ? 1 : 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl hover:from-red-500 hover:to-rose-600 disabled:opacity-50 flex items-center justify-center min-w-[120px] font-bold shadow-xl transition-all"
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Deleting...</span>
                  </span>
                ) : (
                  'Delete'
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
