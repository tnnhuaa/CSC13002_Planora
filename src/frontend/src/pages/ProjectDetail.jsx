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
  MoreVertical,
  Trash2,
  Edit2,
  CheckCircle,
  LayoutGrid,
  List,
  Target,
  ChevronRight,
  Play,
  BarChart,
  ArrowLeft,
} from "lucide-react";
import { projectService } from "../services/projectService";
import { userService } from "../services/userService";
import { generateAvatarColor, getAvatarInitial } from "../utils/avatarUtils";
import { issueService } from "../services/issueService";
import { commentService } from "../services/commentService";
import CreateIssue from "../components/CreateIssue";
import { useAuthStore } from "../stores/useAuthStore";
import TaskFilterBar from "../components/TaskFilterBar";
import { UseTaskFilter } from "../hooks/UseTaskFilter";
import CommentInput from "../components/CommentInput";
import CommentText from "../components/CommentText";
import EditIssue from "../components/EditIssue";
import DeleteIssueConfirmation from "../components/DeleteIssueConfirmation";
import CreateSprint from "../components/CreateSprint";
import { showToast } from "../utils/toastUtils";

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingMessage, setEditingMessage] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditIssueModalOpen, setIsEditIssueModalOpen] = useState(false);
  const [isDeleteIssueModalOpen, setIsDeleteIssueModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [activeTab, setActiveTab] = useState("issues"); // New state for tab navigation
  const [expandedSprints, setExpandedSprints] = useState({ "sprint-3": true }); // Track which sprints are expanded
  const [isBacklogExpanded, setIsBacklogExpanded] = useState(true); // Track if unassigned backlog is expanded
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false);
  const [openSprintMenu, setOpenSprintMenu] = useState(null);
  const [sprintsData, setSprintsData] = useState([]);

  const {
    searchTerm,
    filters,
    sortOrder,
    openFilter,
    filteredAndSortedTasks,
    setSearchTerm,
    handleFilterChange,
    setOpenFilter,
    getUniqueTypes,
    getUniquePriorities,
    getUniqueAssignees,
    toggleSortOrder,
    getPriorityDisplay,
  } = UseTaskFilter(issues);

  const calculateDaysLeft = (dateString) => {
    if (!dateString) return null;
    const due = new Date(dateString);
    const today = new Date();
    // Reset hours to compare dates only
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
      showToast.success("Issue created successfully");
    } catch (error) {
      console.error("Failed to create issue:", error);
      showToast.error("Failed to create issue");
    }
  };

  const handleIssueClick = async (issue) => {
    setSelectedIssue(issue);
    await fetchComments(issue._id);
    // Scroll to comment section
    setTimeout(() => {
      document
        .getElementById("comment-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const fetchComments = async (issueId) => {
    try {
      setLoadingComments(true);
      const response = await commentService.getCommentsByIssue(issueId);
      setComments(response.data || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      showToast.error("Failed to fetch comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !selectedIssue) return;

    try {
      await commentService.createComment(selectedIssue._id, newComment.trim());
      setNewComment("");
      await fetchComments(selectedIssue._id);
      showToast.success("Comment added successfully");
    } catch (error) {
      showToast.error("Failed to add comment");
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingMessage(comment.message);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingMessage.trim()) return;

    try {
      await commentService.updateComment(commentId, editingMessage.trim());
      setEditingCommentId(null);
      setEditingMessage("");
      await fetchComments(selectedIssue._id);
      showToast.success("Comment updated successfully");
    } catch (error) {
      console.error("Failed to update comment:", error);
      showToast.error(error.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await commentService.deleteComment(commentId);
      await fetchComments(selectedIssue._id);
      showToast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      showToast.error(error.message || "Failed to delete comment");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
      setSelectedMembers((prev) => [...prev, { userId, role: "member" }]);
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
      showToast.error("Please select at least one member!");
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
      showToast.error("Failed to add members");
    }
  };

  const handleCloseAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
    setSelectedMembers([]);
    setSearchQuery("");
  };

  const handleEditIssue = (issue, e) => {
    e.stopPropagation(); // Prevent clicking the card behind it
    setSelectedIssue(issue);
    setIsEditIssueModalOpen(true);
  };

  const handleUpdateIssueSubmit = async (updatedIssueData) => {
    try {
      const response = await issueService.updateIssue(
        updatedIssueData._id,
        updatedIssueData
      );

      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue._id === updatedIssueData._id
            ? { ...issue, ...updatedIssueData }
            : issue
        )
      );

      setIsEditIssueModalOpen(false);
      setSelectedIssue(null);
      showToast.success("Issue updated successfully");
    } catch (error) {
      console.error("Failed to update issue:", error);
      showToast.error("Failed to update issue: " + error.message);
    }
  };

  const handleDeleteIssue = (issue, e) => {
    e.stopPropagation();
    setSelectedIssue(issue);
    setIsDeleteIssueModalOpen(true);
  };

  const handleConfirmDelete = (deletedIssueId) => {
    setIssues((prevIssues) =>
      prevIssues.filter((issue) => issue._id !== deletedIssueId)
    );

    setIsDeleteIssueModalOpen(false);
    setSelectedIssue(null);
  };

  const getIssuesByStatus = (status) => {
    return filteredAndSortedTasks.filter((issue) => issue.status === status);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700",
      medium:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
      low: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
    };
    return colors[priority] || colors.medium;
  };

  const getTypeColor = (type) => {
    const colors = {
      task: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
      bug: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700",
      story:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700",
    };
    return colors[type] || colors.task;
  };
  const getDueDateLabel = (dateString) => {
    if (!dateString) return "";
    const days = calculateDaysLeft(dateString);

    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  };
  const getDueDateColor = (dateString) => {
    if (!dateString)
      return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600";

    const days = calculateDaysLeft(dateString);

    if (days < 0) {
      // Overdue: Red
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700";
    }
    if (days === 0 || days <= 3) {
      // Due Soon (<= 3 days): Orange/Yellow
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700";
    }
    // Safe: Gray
    return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600";
  };

  // Mock data for sprints - aligned with backend Sprint schema
  const mockSprintsData = [
    {
      id: "sprint-4",
      name: "Sprint 4",
      goal: "Implement core features for user engagement",
      status: "planning", // Backend enum: planning, active, completed, cancelled
      start_date: "2025-01-13",
      end_date: "2025-01-27",
      tasksCompleted: 0,
      tasksTotal: 5,
      pointsCompleted: 0,
      pointsTotal: 28,
      progress: 0,
      issues: [
        {
          id: "PLAN-011",
          title: "Implement notification system",
          priority: "high",
          type: "Feature",
          assignee: "MK",
          dueDate: "2025-01-15",
          status: "Jan 15",
        },
        {
          id: "PLAN-012",
          title: "Add export functionality",
          priority: "medium",
          type: "Feature",
          assignee: "LT",
          dueDate: "2025-01-18",
          status: "Jan 18",
        },
        {
          id: "PLAN-013",
          title: "Optimize database queries",
          priority: "high",
          type: "Enhancement",
          assignee: "AJ",
          dueDate: "2025-01-16",
          status: "Jan 16",
        },
        {
          id: "PLAN-014",
          title: "Add user permissions",
          priority: "medium",
          type: "Feature",
          assignee: "CW",
          dueDate: "2025-01-20",
          status: "Jan 20",
        },
        {
          id: "PLAN-015",
          title: "Fix mobile responsiveness",
          priority: "high",
          type: "Bug",
          assignee: "BS",
          dueDate: "2025-01-14",
          status: "Jan 14",
        },
      ],
    },
    {
      id: "sprint-3",
      name: "Sprint 3",
      goal: "Complete authentication and UI improvements",
      status: "active", // Backend enum: planning, active, completed, cancelled
      start_date: "2024-12-30",
      end_date: "2025-01-13",
      tasksCompleted: 0,
      tasksTotal: 4,
      pointsCompleted: 0,
      pointsTotal: 21,
      progress: 0,
      issues: [
        {
          id: "PLAN-001",
          title: "Design new login page",
          priority: "high",
          type: "Feature",
          assignee: "AJ",
          dueDate: "2025-01-03",
          status: "Due Soon",
        },
        {
          id: "PLAN-002",
          title: "API integration for user data",
          priority: "medium",
          type: "Feature",
          assignee: "CW",
          dueDate: "2025-01-07",
          status: "Jan 7",
        },
        {
          id: "PLAN-003",
          title: "Fix navigation menu bug",
          priority: "high",
          type: "Bug",
          assignee: "AJ",
          dueDate: "2025-01-03",
          status: "Due Soon",
        },
        {
          id: "PLAN-004",
          title: "Implement dark mode",
          priority: "medium",
          type: "Feature",
          assignee: "BS",
          dueDate: "2025-01-10",
          status: "Jan 10",
        },
      ],
    },
    {
      id: "sprint-2",
      name: "Sprint 2",
      goal: "Setup infrastructure and core features",
      status: "completed", // Backend enum: planning, active, completed, cancelled
      start_date: "2024-12-16",
      end_date: "2024-12-30",
      tasksCompleted: 3,
      tasksTotal: 3,
      pointsCompleted: 18,
      pointsTotal: 18,
      progress: 100,
      issues: [
        {
          id: "PLAN-007",
          title: "Setup CI/CD pipeline",
          priority: "high",
          type: "Feature",
          assignee: "AJ",
          dueDate: "2024-12-28",
          status: "Completed",
        },
        {
          id: "PLAN-008",
          title: "Implement authentication",
          priority: "high",
          type: "Feature",
          assignee: "CW",
          dueDate: "2024-12-30",
          status: "Completed",
        },
        {
          id: "PLAN-009",
          title: "Create project dashboard",
          priority: "medium",
          type: "Feature",
          assignee: "BS",
          dueDate: "2024-12-29",
          status: "Completed",
        },
      ],
    },
    {
      id: "sprint-1",
      name: "Sprint 1",
      goal: "Project foundation and architecture",
      status: "completed", // Backend enum: planning, active, completed, cancelled
      start_date: "2024-12-02",
      end_date: "2024-12-16",
      tasksCompleted: 2,
      tasksTotal: 2,
      pointsCompleted: 13,
      pointsTotal: 13,
      progress: 100,
      issues: [
        {
          id: "PLAN-005",
          title: "Project initialization",
          priority: "high",
          type: "Feature",
          assignee: "AJ",
          dueDate: "2024-12-15",
          status: "Completed",
        },
        {
          id: "PLAN-006",
          title: "Database schema design",
          priority: "high",
          type: "Feature",
          assignee: "MK",
          dueDate: "2024-12-18",
          status: "Completed",
        },
      ],
    },
  ];

  // Initialize sprints data
  useEffect(() => {
    setSprintsData(mockSprintsData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSprint = (sprintId) => {
    setExpandedSprints((prev) => ({
      ...prev,
      [sprintId]: !prev[sprintId],
    }));
  };

  // Get issues that are not assigned to any sprint
  const getUnassignedIssues = () => {
    const assignedIssueIds = new Set();
    
    // Collect all issue IDs that are assigned to sprints
    sprintsData.forEach(sprint => {
      if (sprint.issues && Array.isArray(sprint.issues)) {
        sprint.issues.forEach(issue => {
          assignedIssueIds.add(issue._id || issue.id);
        });
      }
    });
    
    mockSprintsData.forEach(sprint => {
      if (sprint.issues && Array.isArray(sprint.issues)) {
        sprint.issues.forEach(issue => {
          assignedIssueIds.add(issue._id || issue.id);
        });
      }
    });
    
    // Return issues not in any sprint
    return issues.filter(issue => !assignedIssueIds.has(issue._id));
  };

  const handleStartSprint = (sprintId) => {
    setSprintsData((prevSprints) =>
      prevSprints.map((sprint) => {
        if (sprint.id === sprintId) {
          // Update status from 'planning' to 'active' and set start_date to today
          return { 
            ...sprint, 
            status: "active",
            start_date: new Date().toISOString().split('T')[0] // Update start date to today
          };
        }
        // Set any other active sprint to completed
        if (sprint.status === "active") {
          return { 
            ...sprint, 
            status: "completed",
            end_date: new Date().toISOString().split('T')[0] // Update end date to today
          };
        }
        return sprint;
      })
    );
    showToast("success", "Sprint started successfully!");
    console.log(`Starting sprint: ${sprintId}`);
    // TODO: Add API call here - POST /api/sprints/:id/start
  };

  const handleCompleteSprint = (sprintId) => {
    setSprintsData((prevSprints) =>
      prevSprints.map((sprint) =>
        sprint.id === sprintId
          ? { 
              ...sprint, 
              status: "completed", 
              progress: 100,
              end_date: new Date().toISOString().split('T')[0] // Update end date to today
            }
          : sprint
      )
    );
    showToast("success", "Sprint completed successfully!");
    console.log(`Completing sprint: ${sprintId}`);
    // TODO: Add API call here - POST /api/sprints/:id/complete
  };

  const handleEditSprint = (sprint) => {
    console.log("Edit sprint:", sprint);
    showToast("info", "Edit sprint feature coming soon!");
    // TODO: Implement edit sprint modal
  };

  const handleDeleteSprint = (sprint) => {
    if (window.confirm(`Are you sure you want to delete ${sprint.name}?`)) {
      setSprintsData((prevSprints) =>
        prevSprints.filter((s) => s.id !== sprint.id)
      );
      showToast("success", "Sprint deleted successfully!");
      console.log("Delete sprint:", sprint.id);
      // TODO: Add API call to delete sprint
    }
  };

  const handleViewSprintReport = (sprint) => {
    console.log("View report for sprint:", sprint);
    showToast("info", "Sprint report view coming soon!");
    // TODO: Implement sprint report view
  };

  const handleCreateSprintSubmit = async (formData) => {
    try {
      // TODO: Implement API call to create sprint
      console.log("Creating sprint:", formData);
      alert("Sprint created successfully!");
      // After successful creation, you would refresh the sprints data
      setIsCreateSprintModalOpen(false);
    } catch (error) {
      console.error("Failed to create sprint:", error);
      alert("Failed to create sprint");
    }
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
      manager:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700",
      member:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
      viewer:
        "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
    };
    return colors[role] || colors.Member;
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-primary dark:text-primary hover:text-primary mb-4 transition"
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
              {getIssuesByStatus("in_review").length}
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
            <span className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-lg">
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
                  {project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString()
                    : "01/01/2025"}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-medium ${
                    project.endDate
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-400 dark:text-slate-500 italic"
                  }`}
                >
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
                  className="bg-primary h-2 rounded-full transition-all"
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
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary text-white text-sm font-medium rounded-lg transition"
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
                    <span
                      className={`ml-auto px-2 py-1 text-xs font-medium rounded-lg border ${getRoleColor(
                        member.role
                      )}`}
                    >
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
        {/* Tab Navigation */}
        <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl p-1 inline-flex gap-1 mb-6">
          <button
            onClick={() => setActiveTab("issues")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "issues"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LayoutGrid size={16} />
            Issues
          </button>
          <button
            onClick={() => setActiveTab("sprints")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "sprints"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <List size={16} />
            Sprints
          </button>
          <button
            onClick={() => setActiveTab("backlog")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "backlog"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Target size={16} />
            Backlog
          </button>
        </div>

        {/* Issues Tab Content */}
        {activeTab === "issues" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Issues ({issues.length})
              </h3>
              <button
                onClick={() => setIsIssueModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary text-white text-sm font-medium rounded-lg transition"
              >
                <Plus size={16} />
                Create Issue
              </button>
            </div>

            {/* Filters and Search */}
            <div className="flex gap-3 mb-4 flex-wrap">
              <TaskFilterBar
                searchTerm={searchTerm}
                filters={filters}
                sortOrder={sortOrder}
                openFilter={openFilter}
                setSearchTerm={setSearchTerm}
                handleFilterChange={handleFilterChange}
                setOpenFilter={setOpenFilter}
                getUniqueTypes={getUniqueTypes}
                getUniquePriorities={getUniquePriorities}
                getUniqueAssignees={getUniqueAssignees}
                toggleSortOrder={toggleSortOrder}
                getPriorityDisplay={getPriorityDisplay}
              />
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
                      ? "in_review"
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
                        {statusIssues.map((issue) => {
                          const daysLeft = calculateDaysLeft(issue.due_date);
                          const issueOver = daysLeft !== null && daysLeft < 0;
                          return (
                            <div
                              key={issue._id}
                              onClick={() => handleIssueClick(issue)}
                              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-sm font-medium text-slate-900 dark:text-white mb-3 line-clamp-2">
                                  {issue.title}
                                </p>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => handleEditIssue(issue, e)}
                                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                                    title="Edit issue"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteIssue(issue, e)}
                                    className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                                    title="Delete issue"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              
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
                                  {getAvatarInitial(
                                    issue.assignee?.username || "Unknown"
                                  )}
                                </div>
                                {issue.due_date && (
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-md border ${getDueDateColor(
                                      issue.due_date
                                    )}`}
                                  >
                                    {getDueDateLabel(issue.due_date)}
                                  </span>
                                )}
                                {issueOver && (
                                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                                    Expired
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <button className="w-full py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition">
                          <Plus size={16} className="mx-auto" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Sprints Tab Content */}
        {activeTab === "sprints" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Sprint Management
              </h3>
              <button
                onClick={() => setIsCreateSprintModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary text-white text-sm font-medium rounded-lg transition"
              >
                <Plus size={16} />
                Create Sprint
              </button>
            </div>

            <div className="space-y-3">
              {sprintsData.map((sprint) => (
                <div
                  key={sprint.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden"
                >
                  {/* Sprint Header */}
                  <div className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <button
                      onClick={() => toggleSprint(sprint.id)}
                      className="flex items-center gap-3 flex-1"
                    >
                      <ChevronRight
                        size={20}
                        className={`text-slate-400 transition-transform ${
                          expandedSprints[sprint.id] ? "rotate-90" : ""
                        }`}
                      />
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                          {sprint.name}
                        </h4>
                        {sprint.status === "active" && (
                          <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-lg">
                            Active
                          </span>
                        )}
                        {sprint.status === "planning" && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg">
                            Planning
                          </span>
                        )}
                        {sprint.status === "completed" && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-lg">
                            Completed
                          </span>
                        )}
                        {sprint.status === "cancelled" && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-lg">
                            Cancelled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {sprint.tasksCompleted}/{sprint.tasksTotal} tasks •{" "}
                        Start: {sprint.start_date}{" "}
                        End: {sprint.end_date} •{" "}
                        Goals: {sprint.goal}
                      </p>
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 w-48">
                        <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all"
                            style={{ width: `${sprint.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-12 text-right">
                          {sprint.progress}%
                        </span>
                      </div>

                      {/* Sprint Action Buttons */}
                      <div className="flex items-center gap-2">
                        {sprint.status === "planning" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartSprint(sprint.id);
                            }}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-1.5"
                          >
                            <Play size={14} />
                            Start Sprint
                          </button>
                        )}

                        {sprint.status === "active" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteSprint(sprint.id);
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-1.5"
                          >
                            <CheckCircle size={14} />
                            Complete Sprint
                          </button>
                        )}

                        {sprint.status === "completed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewSprintReport(sprint);
                            }}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-1.5"
                          >
                            <BarChart size={14} />
                            View Report
                          </button>
                        )}

                        {/* More Actions Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenSprintMenu(sprint.id === openSprintMenu ? null : sprint.id);
                            }}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition"
                          >
                            <MoreVertical size={18} className="text-slate-600 dark:text-slate-400" />
                          </button>

                          {openSprintMenu === sprint.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenSprintMenu(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 min-w-[180px]">
                                {sprint.status !== "completed" && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditSprint(sprint);
                                        setOpenSprintMenu(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition rounded-t-lg"
                                    >
                                      <Edit2 size={14} />
                                      Edit Sprint
                                    </button>
                                  </>
                                )}

                                {sprint.status === "completed" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewSprintReport(sprint);
                                      setOpenSprintMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition rounded-t-lg"
                                  >
                                    <BarChart size={14} />
                                    View Report
                                  </button>
                                )}

                                {sprint.status !== "active" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSprint(sprint);
                                      setOpenSprintMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition rounded-b-lg border-t border-slate-200 dark:border-slate-700"
                                  >
                                    <Trash2 size={14} />
                                    Delete Sprint
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sprint Issues */}
                  {expandedSprints[sprint.id] && sprint.issues.length > 0 && (
                    <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                        {sprint.issues.map((issue) => (
                          <div
                            key={issue.id}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-md transition"
                          >
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                              {issue.id}
                            </p>
                            <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                              {issue.title}
                            </h5>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-lg border ${
                                  issue.priority === "high"
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                                    : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700"
                                }`}
                              >
                                {issue.priority.charAt(0).toUpperCase() +
                                  issue.priority.slice(1)}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-lg border ${
                                  issue.type === "Bug"
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                                    : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700"
                                }`}
                              >
                                {issue.type}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{
                                  backgroundColor: generateAvatarColor(
                                    issue.assignee
                                  ),
                                }}
                              >
                                {issue.assignee}
                              </div>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-lg border ${
                                  issue.status === "Due Soon"
                                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                {issue.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Backlog Tab Content */}
        {activeTab === "backlog" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Product Backlog
              </h3>
              <button
                onClick={() => setIsCreateSprintModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary text-white text-sm font-medium rounded-lg transition"
              >
                <Plus size={16} />
                Create Sprint
              </button>
            </div>

            <div className="space-y-3">
              {/* Backlog Section */}
              {getUnassignedIssues().length > 0 && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                  {/* Backlog Header */}
                  <button
                    onClick={() => setIsBacklogExpanded(!isBacklogExpanded)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight
                        size={20}
                        className={`text-slate-400 transition-transform ${
                          isBacklogExpanded ? "rotate-90" : ""
                        }`}
                      />
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                          Backlog
                        </h4>
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg">
                          Not in Sprint
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {getUnassignedIssues().length} {getUnassignedIssues().length === 1 ? 'issue' : 'issues'}
                      </p>
                    </div>
                  </button>

                  {/* Unassigned Issues List */}
                  {isBacklogExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                        {getUnassignedIssues().map((issue) => (
                          <div
                            key={issue._id}
                            onClick={() => handleIssueClick(issue)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-md transition cursor-pointer"
                          >
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                              {issue._id?.slice(-6) || 'N/A'}
                            </p>
                            <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                              {issue.title}
                            </h5>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(issue.priority)}`}
                              >
                                {issue.priority?.charAt(0).toUpperCase() + issue.priority?.slice(1)}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-lg border ${getTypeColor(issue.type)}`}
                              >
                                {issue.type}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{
                                  backgroundColor: generateAvatarColor(
                                    issue.assignee?.username || "Unassigned"
                                  ),
                                }}
                              >
                                {getAvatarInitial(issue.assignee?.username || "U")}
                              </div>
                              {issue.due_date && (
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-lg border ${getDueDateColor(issue.due_date)}`}
                                >
                                  {getDueDateLabel(issue.due_date)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sprints Section */}
              {mockSprintsData.map((sprint) => (
                <div
                  key={sprint.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden"
                >
                  {/* Sprint Header */}
                  <button
                    onClick={() => toggleSprint(sprint.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight
                        size={20}
                        className={`text-slate-400 transition-transform ${
                          expandedSprints[sprint.id] ? "rotate-90" : ""
                        }`}
                      />
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                          {sprint.name}
                        </h4>
                        {sprint.status === "current" && (
                          <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-lg">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {sprint.tasksCompleted}/{sprint.tasksTotal} tasks •{" "}
                        {sprint.pointsCompleted}/{sprint.pointsTotal} points
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 w-48">
                        <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all"
                            style={{ width: `${sprint.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-12 text-right">
                          {sprint.progress}%
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Sprint Issues */}
                  {expandedSprints[sprint.id] && sprint.issues.length > 0 && (
                    <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                        {sprint.issues.map((issue) => (
                          <div
                            key={issue.id}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-md transition"
                          >
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                              {issue.id}
                            </p>
                            <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                              {issue.title}
                            </h5>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-lg border ${
                                  issue.priority === "high"
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                                    : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700"
                                }`}
                              >
                                {issue.priority.charAt(0).toUpperCase() +
                                  issue.priority.slice(1)}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-lg border ${
                                  issue.type === "Bug"
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                                    : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700"
                                }`}
                              >
                                {issue.type}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{
                                  backgroundColor: generateAvatarColor(
                                    issue.assignee
                                  ),
                                }}
                              >
                                {issue.assignee}
                              </div>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-lg border ${
                                  issue.status === "Due Soon"
                                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                {issue.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Comment Section */}
      {selectedIssue && (
        <div
          id="comment-section"
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6"
        >
          {/* Issue Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedIssue.title}
              </h3>
            </div>
            <button
              onClick={() => setSelectedIssue(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Comments ({comments.length})
          </h4>

          {/* Add Comment */}
          <div className="mb-6">
            <CommentInput
              value={newComment}
              onChange={setNewComment}
              onSubmit={handleCommentSubmit}
              placeholder="Add new comment... (Type @ to mention someone)"
              members={project?.members || []}
              disabled={!selectedIssue}
              currentUser={user}
            />
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {[...comments].reverse().map((comment) => {
                const isOwner = user?._id === comment.user?._id;
                const isEditing = editingCommentId === comment._id;
                const avatarColor = generateAvatarColor(
                  comment.user?.username || "Unknown"
                );
                const isMenuOpen = openMenuId === comment._id;

                return (
                  <div
                    key={comment._id}
                    className="flex gap-3 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {comment.user?.username?.substring(0, 2).toUpperCase() ||
                        "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {comment.user?.username || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(comment.updatedAt)}
                            {comment.updatedAt > comment.createdAt && (
                              <span
                                className="ml-1 text-xs italic opacity-70"
                                title={formatDate(comment.updatedAt)}
                              >
                                (edited)
                              </span>
                            )}
                          </p>
                          {user?._id === comment.user?._id && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                              You
                            </span>
                          )}
                        </div>
                        {isOwner && !isEditing && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(isMenuOpen ? null : comment._id);
                              }}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {isMenuOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 min-w-[120px]">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditComment(comment);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition rounded-t-lg"
                                  >
                                    <Edit2 size={14} />
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteComment(comment._id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition rounded-b-lg"
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {isEditing ? (
                        <div>
                          <textarea
                            value={editingMessage}
                            onChange={(e) => setEditingMessage(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-600 text-slate-900 dark:text-white text-sm mb-2"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(comment._id)}
                              className="px-3 py-1 bg-primary hover:bg-primary text-white text-xs font-medium rounded transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingMessage("");
                              }}
                              className="px-3 py-1 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 text-xs font-medium rounded transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <CommentText
                          text={comment.message}
                          className="text-slate-700 dark:text-slate-300"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
                  className="px-4 py-2 bg-primary hover:bg-primary text-white rounded-lg"
                >
                  Add Members
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedIssue && (
        <EditIssue
          isOpen={isEditIssueModalOpen}
          onClose={() => {
            setIsEditIssueModalOpen(false);
            setSelectedIssue(null);
          }}
          issueData={selectedIssue}
          onUpdateIssue={handleUpdateIssueSubmit}
        />
      )}

      {/* Delete Issue Confirmation Modal */}
      <DeleteIssueConfirmation
        isOpen={isDeleteIssueModalOpen}
        // CLEANUP: You only need the 'issue' prop based on the component we built
        issue={selectedIssue}
        onClose={() => {
          setIsDeleteIssueModalOpen(false);
          setSelectedIssue(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* CREATE SPRINT MODAL */}
      <CreateSprint
        isOpen={isCreateSprintModalOpen}
        onClose={() => setIsCreateSprintModalOpen(false)}
        onCreateSprint={handleCreateSprintSubmit}
      />
    </div>
  );
}

export default ProjectDetail;
