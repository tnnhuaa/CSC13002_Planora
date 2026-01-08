import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  CheckCircle,
  Users,
  Edit2,
  Trash2,
  Search,
  X,
} from "lucide-react";
import { projectService } from "../services/projectService";
import { userService } from "../services/userService";
import { showToast } from "../utils/toastUtils";
import { ClipLoader } from "react-spinners";

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [assignees, setAssignees] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);

  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    members: [],
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
  });

  const isProjectManager = (project) => {
    if (!currentUser || !project || !project.manager) return false;
    const managerId = project.manager._id || project.manager;
    return managerId.toString() === currentUser._id.toString();
  };

  // Fetch data
  const fetchProjects = async () => {
    try {
      setLoading(true);

      const [projectRes, assigneeRes, userRes] = await Promise.all([
        projectService.getMyProjects(),
        userService.getAssignee().catch((err) => {
          return { data: [] };
        }),
        userService.getCurrentUser(),
      ]);

      let projectList = [];
      if (Array.isArray(projectRes)) {
        projectList = projectRes;
      }

      setProjects(projectList);

      setStats({
        total: projectList.length,
        active: projectList.filter((p) =>
          ["in_progress", "todo"].includes(p.status)
        ).length,
        completed: projectList.filter((p) => p.status === "done").length,
      });

      setAssignees(assigneeRes.data || []);

      setCurrentUser(userRes.user || userRes.data || userRes);
    } catch (error) {
      console.error("Error when fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Process
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast.error("Project Name is required!");
      return;
    }
    try {
      const payload = {
        ...formData,
        members: formData.members,
      };

      await projectService.createProject(payload);
      setIsModalOpen(false);
      setFormData({ name: "", description: "", members: [] });
      setSearchQuery("");

      await fetchProjects();
      showToast.success("Project created successfully!");
    } catch (error) {
      console.error("Failed to create project:", error);
      showToast.error("Failed to create project. Please try again.");
    }
  };

  // Filter assignees based on search query
  const filteredAssignees = assignees.filter((user) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false;

    const username = (user.username || "").toLowerCase();
    const email = (user.email || "").toLowerCase();

    // Ignore already selected members
    if (formData.members.some((member) => member.userId === user._id))
      return false;

    // Ignore if user is a current user
    if (currentUser && user._id === currentUser._id) return false;

    return username.includes(query) || email.includes(query);
  });

  // Get selected members details with role
  const selectedMembers = formData.members
    .map((member) => {
      const user = assignees.find((u) => u._id === member.userId);
      return user ? { ...user, role: member.role } : null;
    })
    .filter(Boolean);

  // Add member to selection with default role
  const addMember = (userId) => {
    if (!formData.members.some((member) => member.userId === userId)) {
      setFormData((prev) => ({
        ...prev,
        members: [...prev.members, { userId, role: "member" }],
      }));
    }
    setSearchQuery(""); // Clear search after adding
  };

  // Remove member from selection
  const removeMember = (userId) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member.userId !== userId),
    }));
  };

  // Update member role
  const updateMemberRole = (userId, newRole) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((member) =>
        member.userId === userId ? { ...member, role: newRole } : member
      ),
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectService.deleteProject(id);
        const res = await projectService.getMyProjects();
        setProjects(res.data || []);

        await fetchProjects();
        showToast.success("Project deleted successfully!");
      } catch (error) {
        console.error("Failed to delete project:", error);
        showToast.error("Failed to delete project. Please try again.");
      }
    }
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setEditFormData({
      name: project.name,
      description: project.description || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormData.name) {
      showToast.error("Project Name is required!");
      return;
    }
    try {
      await projectService.updateProject(editingProject._id, editFormData);
      setIsEditModalOpen(false);
      setEditingProject(null);
      setEditFormData({ name: "", description: "" });
      await fetchProjects();
      showToast.success("Project updated successfully!");
    } catch (error) {
      console.error("Failed to update project:", error);
      showToast.error("Failed to update project. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <ClipLoader color="#3b82f6" size={50} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Projects
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create and manage your projects
            </p>
          </div>
          {currentUser && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary text-white rounded-lg transition"
            >
              <Plus size={20} />
              Create Project
            </button>
          )}
        </div>
      </div>

      {/* Project Management Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">
          Project Management
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Create and manage your projects
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Total Projects
            </p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {stats.total}
            </p>
          </div>
          {/*
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Active Projects
            </p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {stats.active}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Completed
            </p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {stats.completed}
            </p>
          </div>
          */}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-2 gap-4">
          {projects.map((project) => {
            const role = project.members?.find(member => member.user?._id === currentUser?._id)?.role || "member";

            return (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="bg-slate-50 dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                    {project.name} 
                    <span className="inline-block px-2 py-1 text-xs uppercase font-medium bg-blue-100 dark:bg-blue-500 text-blue-700 dark:text-white rounded ml-2">
                      {role || "member"}
                    </span>
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    {project.description || <span className="italic">No description.</span>}
                  </p>
                </div>
                {isProjectManager(project) && (
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()} // Chặn click để không vào trang detail
                  >
                    <button 
                      onClick={() => handleEditClick(project)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                    >
                      <Edit2
                        size={16}
                        className="text-slate-600 dark:text-slate-400"
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">
                    Progress
                  </span>
                  <span className="text-slate-800 dark:text-white font-medium">
                    {(project.progress).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${project.progress}%`,
                    }}
                  />
                </div>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Start Date
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                      {project.createdAt
                        ? new Date(project.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Issues
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                      {project.issueCount || 0} issues
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Members
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                      {Array.isArray(project.members)
                        ? project.members.length
                        : 0}{" "}
                      members
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );})}
        </div>
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Create New Project
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Set up a new project
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter project name..."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the project..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>

              {/* MULTI-SELECT ASSIGNEES */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assign Members
                </label>

                {/* Search Input */}
                <div className="relative mb-2">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Search Results Dropdown */}
                {searchQuery && filteredAssignees.length > 0 && (
                  <div className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 max-h-48 overflow-y-auto mb-2 shadow-lg">
                    {filteredAssignees.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => addMember(user._id)}
                        className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex-1">
                          <span className="block font-medium text-slate-700 dark:text-slate-200 text-sm">
                            {user.username}
                          </span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                          </span>
                        </div>
                        {formData.members.some(
                          (member) => member.userId === user._id
                        ) && (
                          <CheckCircle
                            size={16}
                            className="text-green-600 flex-shrink-0"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results Message */}
                {searchQuery && filteredAssignees.length === 0 && (
                  <div className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 mb-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center italic">
                      No users found matching "{searchQuery}"
                    </p>
                  </div>
                )}

                {/* Selected Members Display with Role Selector */}
                {selectedMembers.length > 0 && (
                  <div className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
                      Selected Members ({selectedMembers.length})
                    </p>
                    <div className="space-y-2">
                      {selectedMembers.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-3 p-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                        >
                          <div className="flex-1">
                            <span className="block font-medium text-slate-700 dark:text-slate-200 text-sm">
                              {user.username}
                            </span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400">
                              {user.email}
                            </span>
                          </div>
                          <select
                            value={user.role}
                            onChange={(e) =>
                              updateMemberRole(user._id, e.target.value)
                            }
                            className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="manager">Manager</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removeMember(user._id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <X
                              size={16}
                              className="text-red-600 dark:text-red-400"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {selectedMembers.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                    No members selected. Search and click to add members.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);

                    // Reset form data
                    setFormData({ name: "", description: "", members: [] });
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary text-white rounded-lg"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Edit Project
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Update project information
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProject(null);
                  setEditFormData({ name: "", description: "" });
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter project name..."
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the project..."
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProject(null);
                    setEditFormData({ name: "", description: "" });
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary text-white rounded-lg"
                >
                  Update Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
