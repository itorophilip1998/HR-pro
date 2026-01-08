'use client';

import { Project, ProjectStatus } from '@/types/project';
import { motion } from 'framer-motion';
import { FaFolderOpen } from 'react-icons/fa';
import { MdEdit, MdDeleteOutline } from 'react-icons/md';

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  selectedProjects?: Set<string>;
  onToggleSelect?: (projectId: string) => void;
  onSelectAll?: () => void;
  showCheckboxes?: boolean;
}

const statusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'bg-gradient-to-r from-green-600 to-emerald-700 text-white',
  [ProjectStatus.ON_HOLD]: 'bg-gradient-to-r from-amber-600 to-orange-700 text-white',
  [ProjectStatus.COMPLETED]: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white',
};

const statusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'Active',
  [ProjectStatus.ON_HOLD]: 'On Hold',
  [ProjectStatus.COMPLETED]: 'Completed',
};

export default function ProjectsTable({
  projects,
  onEdit,
  onDelete,
  selectedProjects = new Set(),
  onToggleSelect,
  onSelectAll,
  showCheckboxes = false,
}: ProjectsTableProps) {
  const handleDelete = (project: Project) => {
    onDelete(project);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="flex justify-center mb-4">
          <FaFolderOpen className="text-6xl text-gray-400" />
        </div>
        <div className="text-gray-800 text-xl font-semibold mb-2">
          No projects found
        </div>
        <div className="text-gray-600 text-base">
          Create your first project to get started!
        </div>
      </motion.div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-purple-100/50">
        <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
          <tr>
            {showCheckboxes && onToggleSelect && (
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={
                    projects.length > 0 &&
                    projects.every((p) => selectedProjects.has(p.id))
                  }
                  onChange={onSelectAll}
                  className="w-5 h-5 accent-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
                />
              </th>
            )}
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
              Deadline
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
              Team Member
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
              Budget
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-purple-100">
          {projects.map((project, index) => (
            <motion.tr
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(168, 85, 247, 0.05)' }}
              className={`group cursor-pointer ${selectedProjects.has(project.id) ? 'bg-purple-50' : ''}`}
            >
              {showCheckboxes && onToggleSelect && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedProjects.has(project.id)}
                    onChange={() => onToggleSelect(project.id)}
                    className="w-5 h-5 accent-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {project.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 inline-flex text-xs leading-5 font-bold rounded-full shadow-lg ${statusColors[project.status]}`}
                >
                  {statusLabels[project.status]}
                </motion.span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-semibold">
                {formatDate(project.deadline)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-800 font-medium">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center text-white font-bold text-xs mr-2 shadow-lg">
                    {project.assignedTeamMember.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-900">{project.assignedTeamMember}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base">
                <span 
                  className="font-extrabold text-lg text-green-700"
                  style={{
                    textShadow: '0 1px 2px rgba(22, 163, 74, 0.2)',
                  }}
                >
                  {formatCurrency(project.budget)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                <div className="flex justify-end gap-1">
                  <motion.button
                    onClick={() => onEdit(project)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    title="Edit project"
                  >
                    <MdEdit className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(project)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    title="Delete project"
                  >
                    <MdDeleteOutline className="w-5 h-5" />
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
