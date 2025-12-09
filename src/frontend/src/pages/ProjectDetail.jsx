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
} from "lucide-react";
import { projectService } from "../services/projectService";
import { generateAvatarColor } from "../utils/avatarUtils";

function ProjectDetail() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch project details
    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                setLoading(true);

                // Sửa thành getMyProjectById
                const res = await projectService.getMyProjects();
                setProject(res.data || res);

                // Mock data for demonstration
                if (!res.data?.tasks) {
                    setTasks([
                        {
                            _id: "1",
                            title: "Fix navigation menu bug",
                            taskId: "PLAN-003",
                            priority: "High",
                            type: "Bug",
                            status: "todo",
                            assignee: {
                                username: "Alice Johnson",
                                avatar: "AJ",
                            },
                            dueDate: "Due Soon",
                        },
                        {
                            _id: "2",
                            title: "Design new login page",
                            taskId: "PLAN-001",
                            priority: "High",
                            type: "Feature",
                            status: "in_progress",
                            assignee: {
                                username: "Alice Johnson",
                                avatar: "AJ",
                            },
                            dueDate: "Due Soon",
                        },
                        {
                            _id: "3",
                            title: "API integration for user data",
                            taskId: "PLAN-002",
                            priority: "Medium",
                            type: "Feature",
                            status: "in_progress",
                            assignee: { username: "Carol White", avatar: "CW" },
                            dueDate: "Dec 16",
                        },
                        {
                            _id: "4",
                            title: "Implement dark mode",
                            taskId: "PLAN-004",
                            priority: "Medium",
                            type: "Feature",
                            status: "review",
                            assignee: { username: "Bob Smith", avatar: "BS" },
                            dueDate: "Dec 19",
                        },
                        {
                            _id: "5",
                            title: "Database migration",
                            taskId: "PLAN-005",
                            priority: "Low",
                            type: "Feature",
                            status: "done",
                            assignee: { username: "Dave Brown", avatar: "DB" },
                            dueDate: "Dec 23",
                        },
                    ]);

                    setComments([
                        {
                            _id: "1",
                            author: "Alice Johnson",
                            avatar: "AJ",
                            content:
                                "Great progress on this task! Let's schedule a review meeting.",
                            createdAt: "2h ago",
                        },
                        {
                            _id: "2",
                            author: "Bob Smith",
                            avatar: "BS",
                            content:
                                "I've completed the initial implementation. Ready for code review.",
                            createdAt: "1d ago",
                        },
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch project details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [projectId]);

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
        }
    };

    const getTasksByStatus = (status) => {
        return tasks.filter((task) => task.status === status);
    };

    const getPriorityColor = (priority) => {
        const colors = {
            High: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700",
            Medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
            Low: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
        };
        return colors[priority] || colors.Medium;
    };

    const getTypeColor = (type) => {
        const colors = {
            Feature:
                "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700",
            Bug: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700",
            Story: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700",
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
                <div className="text-slate-800 dark:text-white">
                    Project not found
                </div>
            </div>
        );
    }

    const teamMembers = project.members || [
        { username: "Alice Johnson", avatar: "AJ" },
        { username: "Bob Smith", avatar: "BS" },
        { username: "Carol White", avatar: "CW" },
        { username: "Dave Brown", avatar: "DB" },
        { username: "Eve Davis", avatar: "ED" },
    ];

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

            {/* Task Status Summary */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Tasks by Status
                </p>
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            To Do
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {getTasksByStatus("todo").length}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            In Progress
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {getTasksByStatus("in_progress").length}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            Review
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {getTasksByStatus("review").length}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            Done
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {getTasksByStatus("done").length}
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
                                    {project.startDate || "Dec 1, 2024"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    End Date
                                </p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {project.endDate || "Feb 28, 2025"}
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Overall Progress
                                </p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {project.progress || 67}%
                                </p>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{
                                        width: `${project.progress || 67}%`,
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
                        <Users
                            size={18}
                            className="text-slate-600 dark:text-slate-400"
                        />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Team Members
                        </h3>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <div className="space-y-3">
                            {teamMembers.map((member) => {
                                const avatarColor = generateAvatarColor(
                                    member.username
                                );
                                return (
                                    <div
                                        key={member.username}
                                        className="flex items-center gap-3"
                                    >
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                            style={{
                                                backgroundColor: avatarColor,
                                            }}
                                        >
                                            {member.avatar}
                                        </div>
                                        <span className="text-sm text-slate-900 dark:text-white">
                                            {member.username}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tasks/Issues Section */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Issues ({tasks.length})
                    </h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
                        <Plus size={16} />
                        Create Issues
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="flex gap-3 mb-4 flex-wrap">
                    <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                        <Search size={16} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
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
                        {["To Do", "In Progress", "Review", "Done"].map(
                            (status) => {
                                const statusTasks = getTasksByStatus(
                                    status === "To Do"
                                        ? "todo"
                                        : status === "In Progress"
                                        ? "in_progress"
                                        : status === "Review"
                                        ? "review"
                                        : "done"
                                );

                                return (
                                    <div
                                        key={status}
                                        className="w-64 flex flex-col gap-3"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                                                {status}
                                            </h4>
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                                                {statusTasks.length}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 min-h-[200px] space-y-2">
                                            {statusTasks.map((task) => (
                                                <div
                                                    key={task._id}
                                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                                                >
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                            {task.taskId}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-3 line-clamp-2">
                                                        {task.title}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        <span
                                                            className={`px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(
                                                                task.priority
                                                            )}`}
                                                        >
                                                            {task.priority}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 text-xs font-medium rounded-md border ${getTypeColor(
                                                                task.type
                                                            )}`}
                                                        >
                                                            {task.type}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div
                                                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                            style={{
                                                                backgroundColor:
                                                                    generateAvatarColor(
                                                                        task
                                                                            .assignee
                                                                            ?.username ||
                                                                            "Unknown"
                                                                    ),
                                                            }}
                                                        >
                                                            {task.assignee
                                                                ?.avatar || "U"}
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 text-xs font-medium rounded-md border ${getDateColor(
                                                                task.dueDate
                                                            )}`}
                                                        >
                                                            {task.dueDate}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            <button className="w-full py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition">
                                                <Plus
                                                    size={16}
                                                    className="mx-auto"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                );
                            }
                        )}
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
        </div>
    );
}

export default ProjectDetail;
