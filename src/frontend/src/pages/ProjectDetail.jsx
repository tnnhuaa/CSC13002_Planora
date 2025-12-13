import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Calendar,
  Users,
  Plus,
  Search,
  ChevronDown,
  Send,
  X,
  Hash,
  CheckCircle,
} from "lucide-react";
import { projectService } from "../services/projectService";
import { userService } from "../services/userService";
import { generateAvatarColor, getAvatarInitial } from "../utils/avatarUtils";
import { issueService } from "../services/issueService";
import CreateIssue from "../components/CreateIssue";

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  // Fetch project details
  const fetchProjectDetails = async () => {
    try {
      const [projectRes, assigneeRes] = await Promise.all([
        projectService.getProjectDetails(projectId),
        userService.getAssignee().catch((err) => ({ data: [] })),
      ]);
      const projectData = projectRes.data || projectRes;

      setProject(projectData);
      setIssues(projectData.issues || []);
      setComments(projectData.comments || []);
      setAssignees(assigneeRes.data || []);
    } catch (error) {
      console.error("Failed to fetch project details:", error);
    }
  };
  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await fetchProjectDetails();
      setLoading(false);
    };

    if (projectId) {
      initFetch();
    }
  }, [projectId]);

  const handleCreateIssueSubmit = async (formData) => {
    try {
      await issueService.createIssue(formData);

      await fetchProjectDetails();

      setIsIssueModalOpen(false);
    } catch (error) {
      console.error("Failed to create issue:", error);
      alert("Failed to create issue");
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      const comment = {
        _id: Date.now().toString(),
        author: "Current User",
        avatar: "CU",
        content: newComment,
        createdAt: "now",
      };
      setComments([...comments, comment]);
      setNewComment("");
      // Todo api
    }
  };

  // Add member handlers
  const teamMembers = project?.members || [];
  const teamMemberIds = teamMembers.map((m) => m.user?._id).filter(Boolean);

  const filteredAssignees = assignees.filter((user) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false;

    const username = (user.username || "").toLowerCase();
    const email = (user.email || "").toLowerCase();

    // Ignore already in team
    if (teamMemberIds.includes(user._id)) return false;

    // Ignore already selected
    if (selectedMembers.some((member) => member.userId === user._id))
      return false;

    return username.includes(query) || email.includes(query);
  });

  const selectedMembersWithDetails = selectedMembers
    .map((member) => {
      const user = assignees.find((u) => u._id === member.userId);
      return user ? { ...user, role: member.role } : null;
    })
    .filter(Boolean);

  const addMember = (userId) => {
    if (!selectedMembers.some((member) => member.userId === userId)) {
      setSelectedMembers((prev) => [
        ...prev,
        { userId, role: "member" },
      ]);
    }
    setSearchQuery("");
  };

  const removeMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.filter((member) => member.userId !== userId)
    );
  };

  const updateMemberRole = (userId, newRole) => {
    setSelectedMembers((prev) =>
      prev.map((member) =>
        member.userId === userId ? { ...member, role: newRole } : member
      )
    );
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (selectedMembers.length === 0) {
      alert("Please select at least one member!");
      return;
    }
    try {
      // Add each member
      for (const member of selectedMembers) {
        await projectService.addMemberToProject(projectId, member);
      }

      // Fetch lại data
      await fetchProjectDetails();

      // Close modal và reset
      setIsAddMemberModalOpen(false);
      setSelectedMembers([]);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to add members:", error);
      alert("Failed to add members");
    }
  };

  const handleCloseAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
    setSelectedMembers([]);
    setSearchQuery("");
  };

  const getIssuesByStatus = (status) => {
    return issues.filter((issue) => issue.status === status);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      High: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700",
      Medium:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
      Low: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
    };
    return colors[priority] || colors.Medium;
  };

  const getTypeColor = (type) => {
    const colors = {
      Feature:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700",
      Bug: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700",
      Story:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700",
    };
    return colors[type] || colors.Feature;
  };

  const getDateColor = (date) => {
    if (date === "Due Soon") {
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700";
    }
    return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-800 dark:text-white">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-800 dark:text-white">Project not found</div>
      </div>
    );
  }

  const getRoleColor = (role) => {
    const colors = {
      manager: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700",
      member: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
      viewer: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
    };
    return colors[role] || colors.Member;
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition"
        >
          <ChevronLeft size={20} />
          Back to Projects
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            {project.title || "Project Details"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {project.description}
          </p>
        </div>
      </div>

      {/* Issue Status Summary */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Issues by Status
        </p>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              To Do
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {getIssuesByStatus("todo").length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              In Progress
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {getIssuesByStatus("in_progress").length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Review
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {getIssuesByStatus("review").length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Done
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {getIssuesByStatus("done").length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Timeline Section */}
        <div className="col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar
                size={18}
                className="text-slate-600 dark:text-slate-400"
              />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Timeline
              </h3>
            </div>
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg">
              Active
            </span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Start Date
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "01/01/2025"}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${project.endDate ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 italic'}`}>
                  Ongoing
                </p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Overall Progress
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {project.progress}%
                </p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${project.progress}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Current Sprint
              </p>
              <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-medium rounded-lg">
                Sprint 3
              </span>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Team Members
            </h3>
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <Plus size={16} />
              <span>Add member</span>
            </button>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="space-y-3">
              {teamMembers.map((member) => {
                const avatarColor = generateAvatarColor(member.user?.username);
                return (
                  <div
                    key={member.user?.username}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        backgroundColor: avatarColor,
                      }}
                    >
                      {getAvatarInitial(member.user?.username)}
                    </div>
                    <span className="text-sm text-slate-900 dark:text-white">
                      {member.user?.username}
                    </span>
                    <span className={`ml-auto px-2 py-1 text-xs font-medium rounded-lg border ${getRoleColor(member.role)}`}>
                      {member.role || "Member"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Issues/Issues Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Issues ({issues.length})
          </h3>
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus size={16} />
            Create Issue
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search issues..."
              className="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 flex-1"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium transition">
            All Sprints
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium transition">
            All Status
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium transition">
            All Assignees
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-4 gap-4 min-w-max pb-4">
            {["To Do", "In Progress", "Review", "Done"].map((status) => {
              const statusIssues = getIssuesByStatus(
                status === "To Do"
                  ? "todo"
                  : status === "In Progress"
                  ? "in_progress"
                  : status === "Review"
                  ? "review"
                  : "done"
              );

              return (
                <div key={status} className="w-64 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                      {status}
                    </h4>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                      {statusIssues.length}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 min-h-[200px] space-y-2">
                    {statusIssues.map((issue) => (
                      <div
                        key={issue._id}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {issue.issueId}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-3 line-clamp-2">
                          {issue.title}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(
                              issue.priority
                            )}`}
                          >
                            {issue.priority}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-md border ${getTypeColor(
                              issue.type
                            )}`}
                          >
                            {issue.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              backgroundColor: generateAvatarColor(
                                issue.assignee?.username || "Unknown"
                              ),
                            }}
                          >
                            {getAvatarInitial(issue.assignee?.username || "Unknown")}
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-md border ${getDateColor(
                              issue.dueDate
                            )}`}
                          >
                            {issue.dueDate}
                          </span>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition">
                      <Plus size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comment Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Comment Section
        </h3>

        {/* Add Comment */}
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-3"
            rows={3}
          />
          <div className="flex justify-end">
            <button
              onClick={handleCommentSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
              disabled={!newComment.trim()}
            >
              <Send size={14} />
              Comment
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => {
            const avatarColor = generateAvatarColor(comment.author);
            return (
              <div key={comment._id} className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: avatarColor }}
                >
                  {comment.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {comment.author}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {comment.createdAt}
                    </p>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE ISSUE MODAL */}
      <CreateIssue
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onCreateIssue={handleCreateIssueSubmit}
        projectPropId={projectId} // Quan trọng: Truyền ID để component tự hiểu
        column="todo"
        members={project?.members || []}
      />

      {/* ADD MEMBER MODAL */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Add Members to Project
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Search and assign team members
                </p>
              </div>
              <button
                onClick={handleCloseAddMemberModal}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit}>
              <div className="space-y-4">
                {/* Search Members */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Search Members
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
                          {selectedMembers.some(
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
                  {selectedMembersWithDetails.length > 0 && (
                    <div className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
                        Selected Members ({selectedMembersWithDetails.length})
                      </p>
                      <div className="space-y-2">
                        {selectedMembersWithDetails.map((user) => (
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
                  {selectedMembersWithDetails.length === 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                      No members selected. Search and click to add members.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseAddMemberModal}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Add Members
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
