import React, { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  CheckSquare,
  Bookmark,
  User,
} from "lucide-react";
import { issueService } from "../services/issueService";
import { projectService } from "../services/projectService";
import { userService } from "../services/userService";

function Issues() {
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);

  const [stats, setStats] = useState({ total: 0, todo: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    project: "", // Project ID
    priority: "medium",
    type: "issue",
    assignee: "", // User ID (String)
    due_date: "",
    story_points: 0,
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
      case "low":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
      default:
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      // Done: Green
      case "done":
        return "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30";

      // In Progress: Blue
      case "in_progress":
        return "text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30";

      // In Review: Purple
      case "in_review":
        return "text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30";

      // Todo (Default): Slate
      default:
        return "text-slate-700 bg-slate-100 dark:text-slate-400 dark:bg-slate-800";
    }
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Get data
      const [issueRes, projectRes, userRes] = await Promise.all([
        issueService.getIssues(),
        projectService.getMyProjects(),
        userService.getCurrentUser(),
      ]);

      const issueList = issueRes.data || [];
      setIssues(issueList);

      setProjects(projectRes.data || []);

      setStats({
        total: issueList.length,
        todo: issueList.filter(
          (t) => t.status === "todo" || t.status === "in_progress"
        ).length,
        done: issueList.filter((t) => t.status === "done").length,
      });

      setCurrentUser(userRes.user);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate
      if (!formData.project) {
        alert("Please select a project");
        return;
      }

      await issueService.createIssue(formData);

      setIsModalOpen(false);
      // Reset form
      setFormData({
        title: "",
        description: "",
        status: "todo",
        project: "",
        priority: "medium",
        type: "issue",
        assignee: "",
        due_date: "",
        story_points: 0,
      });

      const res = await issueService.getIssues();
      setIssues(res.data || []);
    } catch (error) {
      console.error("Failed to create issue:", error);
      alert(error.message || "Failed to create issue");
    }
  };

  //   // Delete Task
  //   const handleDelete = async (id) => {
  //     if (window.confirm("Are you sure you want to delete this task?")) {
  //       try {
  //         console.log("=== LÀM SAU ===");
  //         // const res = await taskService.getTasks();
  //         // setTasks(res.data || []);
  //       } catch (error) {
  //         console.error("Failed to delete task:", error);
  //       }
  //     }
  //   };

  // Process project
  const selectedProject = projects.find(
    (p) => (p._id || p.id) === formData.project
  );

  const filteredAssignees =
    selectedProject && selectedProject.members ? selectedProject.members : [];

  return (
    <div className="p-6 bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              My Issues
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your daily issues and bugs
            </p>
          </div>
          {currentUser &&
            (currentUser.role === "project manager" ||
              currentUser.role === "admin") && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <Plus size={20} />
                Create Issue
              </button>
            )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Giữ nguyên phần stats như cũ cho gọn code... */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Total Issues
          </p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            {stats.total}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Pending
          </p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            {stats.todo}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Completed
          </p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            {stats.done}
          </p>
        </div>
      </div>

      {/* Issue List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="text-slate-500">Loading...</div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue._id}
              className="bg-slate-50 dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                      {issue.title}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        issue.type === "bug"
                          ? "border-red-200 text-red-700 bg-red-50"
                          : "border-blue-200 text-blue-700 bg-blue-50"
                      }`}
                    >
                      {issue.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {issue.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(issue._id)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                    issue.status
                  )}`}
                >
                  {issue.status?.replace("_", " ").toUpperCase()}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded capitalize ${getPriorityColor(
                    issue.priority
                  )}`}
                >
                  {issue.priority}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {issue.story_points} pts
                </span>
              </div>

              {/* Footer Info */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>
                    Due:{" "}
                    {issue.due_date
                      ? new Date(issue.due_date).toLocaleDateString()
                      : "No date"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span className="truncate">
                    Assignee: {issue.assignee?.username || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Issue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                Create New Issue
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Title & Type */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    placeholder="Issue title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  >
                    <option value="issue">Issue</option>
                    <option value="bug">Bug</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  rows={3}
                  placeholder="Issue details..."
                />
              </div>

              {/* Row 3: Project & Assignee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PROJECT SELECT */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Project
                  </label>
                  <select
                    value={formData.project}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        project: e.target.value,
                        assignee: "",
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.title || p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ASSIGNEE SELECT (FILTERED) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assign To{" "}
                    {formData.project &&
                      `(${filteredAssignees.length} members)`}
                  </label>
                  <select
                    value={formData.assignee}
                    onChange={(e) =>
                      setFormData({ ...formData, assignee: e.target.value })
                    }
                    disabled={!formData.project}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!formData.project
                        ? "Please select a project first"
                        : "Select an Assignee"}
                    </option>

                    {/* Map filtered list */}
                    {filteredAssignees.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Status, Priority, Story Points */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Story Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.story_points}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        story_points: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 5: Due Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Issues;
