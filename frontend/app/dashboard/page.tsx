"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Project, ProjectStatus } from "@/types/project";
import { getProjects, deleteProject } from "@/lib/api";
import ProjectsTable from "@/components/ProjectsTable";
import ProjectModal from "@/components/ProjectModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProfileDropdown from "@/components/ProfileDropdown";
import Pagination from "@/components/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartBar,
  FaCheckCircle,
  FaPauseCircle,
  FaTrophy,
  FaDollarSign,
} from "react-icons/fa";

interface User {
  id: string;
  email: string;
  name: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">(
    "ALL"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onHold: 0,
    completed: 0,
    totalBudget: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token) {
      router.push("/signin");
    } else if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, [router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open add project
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        handleAddProject();
      }
      // Ctrl/Cmd + / to show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
      }
      // Escape to close modals
      if (e.key === "Escape") {
        if (isModalOpen) {
          setIsModalOpen(false);
          setEditingProject(null);
        }
        if (isDeleteModalOpen) {
          setIsDeleteModalOpen(false);
          setDeletingProject(null);
        }
        setShowKeyboardShortcuts(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isModalOpen, isDeleteModalOpen, showKeyboardShortcuts]);

  const fetchProjects = useCallback(async (showRefreshSpinner = false) => {
    try {
      if (showRefreshSpinner) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await getProjects();
      setProjects(data);
      setFilteredProjects(data);

      // Calculate stats
      const statsData = {
        total: data.length,
        active: data.filter((p) => p.status === ProjectStatus.ACTIVE).length,
        onHold: data.filter((p) => p.status === ProjectStatus.ON_HOLD).length,
        completed: data.filter((p) => p.status === ProjectStatus.COMPLETED)
          .length,
        totalBudget: data.reduce((sum, p) => sum + p.budget, 0),
      };
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter and search logic
  useEffect(() => {
    let filtered = projects;

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.assignedTeamMember.toLowerCase().includes(query)
      );
    }

    setFilteredProjects(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [projects, statusFilter, searchQuery]);

  const handleAddProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleModalSave = async () => {
    await fetchProjects();
  };

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;

    setIsDeleting(true);
    try {
      await deleteProject(deletingProject.id);
      setIsDeleteModalOpen(false);
      setDeletingProject(null);
      setSelectedProjects(new Set());
      await fetchProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedProjects.size === 0) return;
    setIsDeleteAllModalOpen(true);
  };

  const handleConfirmDeleteAllFromModal = () => {
    if (selectedProjects.size === filteredProjects.length) {
      handleConfirmDeleteAll();
    } else {
      handleConfirmDeleteSelected();
    }
  };

  const handleConfirmDeleteSelected = async () => {
    if (selectedProjects.size === 0) return;

    setIsDeletingAll(true);
    try {
      const deletePromises = Array.from(selectedProjects).map((id) =>
        deleteProject(id)
      );
      await Promise.all(deletePromises);
      setIsDeleteAllModalOpen(false);
      setIsDeleteMode(false);
      setSelectedProjects(new Set());
      await fetchProjects();
    } catch (error) {
      console.error("Failed to delete projects:", error);
      alert("Failed to delete some projects. Please try again.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleDeleteAllProjects = () => {
    if (filteredProjects.length === 0) return;
    // Enable delete mode without selecting any projects by default
    setIsDeleteMode(true);
    setSelectedProjects(new Set());
  };

  const handleCancelDeleteMode = () => {
    setIsDeleteMode(false);
    setSelectedProjects(new Set());
  };

  const handleConfirmDeleteAll = async () => {
    if (filteredProjects.length === 0) return;

    setIsDeletingAll(true);
    try {
      const deletePromises = filteredProjects.map((project) =>
        deleteProject(project.id)
      );
      await Promise.all(deletePromises);
      setIsDeleteAllModalOpen(false);
      setIsDeleteMode(false);
      setSelectedProjects(new Set());
      await fetchProjects();
    } catch (error) {
      console.error("Failed to delete all projects:", error);
      alert("Failed to delete all projects. Please try again.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleToggleSelect = (projectId: string) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const handleSelectAll = () => {
    const currentPageProjects = filteredProjects.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    const currentPageIds = new Set(currentPageProjects.map((p) => p.id));
    const allCurrentPageSelected = currentPageIds.size > 0 && 
      Array.from(currentPageIds).every(id => selectedProjects.has(id));
    
    if (allCurrentPageSelected) {
      // Deselect all on current page
      const newSelected = new Set(selectedProjects);
      currentPageIds.forEach(id => newSelected.delete(id));
      setSelectedProjects(newSelected);
    } else {
      // Select all on current page
      const newSelected = new Set(selectedProjects);
      currentPageIds.forEach(id => newSelected.add(id));
      setSelectedProjects(newSelected);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
        <LoadingSpinner size="lg" text="Loading projects..." />
      </div>
    );
  }

  // Format budget with K/M/B abbreviations
  const formatBudget = (amount: number): string => {
    if (amount >= 1000000000) {
      // Billions
      const billions = amount / 1000000000;
      return `$${billions.toFixed(billions >= 10 ? 0 : 1)}B`;
    } else if (amount >= 1000000) {
      // Millions
      const millions = amount / 1000000;
      return `$${millions.toFixed(millions >= 10 ? 0 : 1)}M`;
    } else if (amount >= 1000) {
      // Thousands
      const thousands = amount / 1000;
      return `$${thousands.toFixed(thousands >= 10 ? 0 : 1)}K`;
    } else {
      // Less than 1000
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
  };

  const statCards = [
    {
      label: "Total Projects",
      value: stats.total,
      color: "from-purple-700 to-purple-900",
      icon: FaChartBar,
    },
    {
      label: "Active",
      value: stats.active,
      color: "from-green-600 to-emerald-700",
      icon: FaCheckCircle,
    },
    {
      label: "On Hold",
      value: stats.onHold,
      color: "from-yellow-500 to-orange-500",
      icon: FaPauseCircle,
    },
    {
      label: "Completed",
      value: stats.completed,
      color: "from-blue-600 to-indigo-700",
      icon: FaTrophy,
    },
    {
      label: "Total Budget",
      value: formatBudget(stats.totalBudget),
      color: "from-gray-600 to-slate-700",
      icon: FaDollarSign,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Refreshing indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 glass backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl p-4 border border-white/20"
          >
            <LoadingSpinner size="sm" text="Refreshing..." />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowKeyboardShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Keyboard Shortcuts
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Add Project</span>
                  <kbd className="px-3 py-1 bg-gray-200 rounded-lg text-sm font-mono">
                    Ctrl/Cmd + K
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Show Shortcuts</span>
                  <kbd className="px-3 py-1 bg-gray-200 rounded-lg text-sm font-mono">
                    Ctrl/Cmd + /
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Close Modal</span>
                  <kbd className="px-3 py-1 bg-gray-200 rounded-lg text-sm font-mono">
                    Esc
                  </kbd>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <motion.div
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
            >
              <ProfileDropdown user={user} onShowShortcuts={() => setShowKeyboardShortcuts(true)} />
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                  {user ? `${user.name}'s Dashboard` : 'Hr-Pro Dashboard'}
                </h1>
                <p className="text-gray-700 mt-1 font-medium">
                  Manage your projects with style
                </p>
              </div>
            </motion.div>
            <div className="mt-4 sm:mt-0 flex gap-3 items-center">
              <motion.button
                onClick={() => fetchProjects(true)}
                disabled={isRefreshing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-4 py-2 glass backdrop-blur-sm bg-white/80 rounded-xl shadow-lg text-sm font-semibold text-gray-700 hover:bg-white/90 disabled:opacity-50 border border-white/20"
                title="Refresh projects"
              >
                <motion.svg
                  className={`w-4 h-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </motion.svg>
                Refresh
              </motion.button>
              {isDeleteMode ? (
                <>
                  {selectedProjects.size > 0 && (
                    <motion.button
                      onClick={handleDeleteSelected}
                      disabled={isDeletingAll}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 rounded-xl shadow-xl text-sm font-bold text-white hover:from-red-500 hover:to-rose-600 focus:outline-none focus:ring-4 focus:ring-red-300/50 transform transition-all disabled:opacity-50"
                      title={`Delete ${selectedProjects.size} selected project(s)`}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Selected ({selectedProjects.size})
                    </motion.button>
                  )}
                  <motion.button
                    onClick={handleCancelDeleteMode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-4 py-2 bg-white rounded-xl shadow-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 border-2 border-purple-200 hover:border-purple-400 transition-all"
                  >
                    Cancel
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    onClick={handleDeleteAllProjects}
                    disabled={filteredProjects.length === 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 rounded-xl shadow-xl text-sm font-bold text-white hover:from-red-500 hover:to-rose-600 focus:outline-none focus:ring-4 focus:ring-red-300/50 transform transition-all disabled:opacity-50"
                    title="Delete All Projects"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete All
                  </motion.button>
                  <motion.button
                    onClick={handleAddProject}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-700 to-purple-900 rounded-xl shadow-xl text-sm font-bold text-white hover:from-purple-600 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300/50 transform transition-all"
                    title="Add Project (Ctrl/Cmd + K)"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Project
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`bg-gradient-to-br ${stat.color} rounded-2xl shadow-2xl p-6 border-2 border-white/30 cursor-pointer hover:shadow-3xl transition-all`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                    <stat.icon className="text-3xl text-white drop-shadow-lg" />
                  </div>
                  <div className="text-right">
                    <p className="text-white/90 text-xs font-semibold uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-white text-3xl font-extrabold mt-1 drop-shadow-lg">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="mb-4 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-lg font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500 group-focus-within:text-purple-700 transition-colors">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name or team member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 text-base bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-300/50 focus:border-purple-600 text-gray-900 placeholder-gray-400 shadow-lg hover:shadow-xl transition-all font-semibold focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-purple-600 transition-colors rounded-full hover:bg-purple-100"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
            <motion.div
              className="sm:w-64"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ProjectStatus | "ALL")
                }
                className="w-full px-5 py-4 text-base bg-white border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-gray-900 shadow-lg font-semibold transition-all"
              >
                <option value="ALL">All Statuses</option>
                <option value={ProjectStatus.ACTIVE}>Active</option>
                <option value={ProjectStatus.ON_HOLD}>On Hold</option>
                <option value={ProjectStatus.COMPLETED}>Completed</option>
              </select>
            </motion.div>
          </div>
        </motion.div>

        {/* Projects Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-purple-100"
        >
          <ProjectsTable
            projects={filteredProjects.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            )}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            selectedProjects={selectedProjects}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            showCheckboxes={isDeleteMode}
          />
        </motion.div>

        {/* Pagination */}
        {filteredProjects.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredProjects.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={filteredProjects.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleModalSave}
        project={editingProject}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProject(null);
        }}
        onConfirm={handleConfirmDelete}
        projectName={deletingProject?.name}
        isDeleting={isDeleting}
      />

      <DeleteConfirmModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => {
          setIsDeleteAllModalOpen(false);
        }}
        onConfirm={handleConfirmDeleteAllFromModal}
        projectName={
          selectedProjects.size > 0
            ? `${selectedProjects.size} selected project(s)`
            : `all ${filteredProjects.length} project(s)`
        }
        isDeleting={isDeletingAll}
      />
    </div>
  );
}
