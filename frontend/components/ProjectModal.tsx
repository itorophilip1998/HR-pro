'use client';

import { Project, ProjectStatus, CreateProjectDto } from '@/types/project';
import { createProject, updateProject } from '@/lib/api';
import LoadingSpinner from './LoadingSpinner';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  project?: Project | null;
}

export default function ProjectModal({
  isOpen,
  onClose,
  onSave,
  project,
}: ProjectModalProps) {
  const [formData, setFormData] = useState<CreateProjectDto>({
    name: '',
    status: ProjectStatus.ACTIVE,
    deadline: '',
    assignedTeamMember: '',
    budget: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateProjectDto, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        status: project.status,
        deadline: project.deadline.split('T')[0],
        assignedTeamMember: project.assignedTeamMember,
        budget: project.budget,
      });
    } else {
      setFormData({
        name: '',
        status: ProjectStatus.ACTIVE,
        deadline: '',
        assignedTeamMember: '',
        budget: 0,
      });
    }
    setErrors({});
  }, [project, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateProjectDto, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }

    if (!formData.assignedTeamMember.trim()) {
      newErrors.assignedTeamMember = 'Team member is required';
    }

    if (formData.budget === undefined || formData.budget === null || formData.budget < 0) {
      newErrors.budget = 'Budget must be a positive number';
    }
    if (formData.budget === 0) {
      newErrors.budget = 'Budget must be greater than 0';
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
      if (project) {
        await updateProject(project.id, formData);
      } else {
        await createProject(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className="glass backdrop-blur-xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-extrabold text-white"
              >
                {project ? 'Edit Project' : 'Add New Project'}
              </motion.h2>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-base font-semibold text-white mb-2">
                  Project Name *
                </label>
                <motion.input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  whileFocus={{ scale: 1.02 }}
                  className={`w-full px-5 py-4 text-base rounded-xl text-gray-900 placeholder-gray-400 bg-white/80 backdrop-blur-sm border-2 shadow-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all ${
                    errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter project name"
                />
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-400 font-medium"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-base font-semibold text-white mb-2">
                  Status *
                </label>
                <motion.select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                  whileFocus={{ scale: 1.02 }}
                  className="w-full px-5 py-4 text-base rounded-xl bg-white/80 backdrop-blur-sm border-2 border-gray-300 text-gray-900 shadow-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 font-semibold transition-all"
                >
                  <option value={ProjectStatus.ACTIVE}>Active</option>
                  <option value={ProjectStatus.ON_HOLD}>On Hold</option>
                  <option value={ProjectStatus.COMPLETED}>Completed</option>
                </motion.select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-base font-semibold text-white mb-2">
                  Deadline *
                </label>
                <motion.input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  whileFocus={{ scale: 1.02 }}
                  className={`w-full px-5 py-4 text-base rounded-xl text-gray-900 bg-white/80 backdrop-blur-sm border-2 shadow-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all ${
                    errors.deadline ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
                <AnimatePresence>
                  {errors.deadline && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-400 font-medium"
                    >
                      {errors.deadline}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-base font-semibold text-white mb-2">
                  Assigned Team Member *
                </label>
                <motion.input
                  type="text"
                  value={formData.assignedTeamMember}
                  onChange={(e) => setFormData({ ...formData, assignedTeamMember: e.target.value })}
                  whileFocus={{ scale: 1.02 }}
                  className={`w-full px-5 py-4 text-base rounded-xl text-gray-900 placeholder-gray-400 bg-white/80 backdrop-blur-sm border-2 shadow-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all ${
                    errors.assignedTeamMember
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter team member email or name"
                />
                <AnimatePresence>
                  {errors.assignedTeamMember && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-400 font-medium"
                    >
                      {errors.assignedTeamMember}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-base font-semibold text-white mb-2">
                  Budget *
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-300 font-bold text-lg">
                    $
                  </span>
                  <motion.input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === '' ? 0 : parseFloat(value);
                      setFormData({
                        ...formData,
                        budget: isNaN(numValue) ? 0 : numValue,
                      });
                    }}
                    whileFocus={{ scale: 1.02 }}
                    className={`w-full pl-10 pr-5 py-4 text-base rounded-xl text-gray-900 placeholder-gray-400 bg-white/80 backdrop-blur-sm border-2 shadow-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all ${
                      errors.budget ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {formData.budget > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent"
                  >
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(formData.budget)}
                  </motion.p>
                )}
                <AnimatePresence>
                  {errors.budget && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-400 font-medium"
                    >
                      {errors.budget}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-end space-x-4 pt-6"
              >
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 text-base font-bold border-2 border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-lg transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                  className="px-8 py-3 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 shadow-xl flex items-center justify-center min-w-[140px] transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Saving...</span>
                    </span>
                  ) : (
                    project ? 'Update' : 'Create'
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
