import React from "react";
import { X, Calendar, Flag, Tag, Hash, Layers, FolderKanban, Zap } from "lucide-react";

const IssueOverview = ({ isOpen, issue, onClose }) => {
    if (!isOpen) return null;

    if (!issue) {
        return (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={onClose}
            >
                <div
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className="text-slate-600 dark:text-slate-400">
                        No issue selected
                    </p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getPriorityConfig = (priority) => {
        const configs = {
            low: {
                bg: "bg-blue-500/10 dark:bg-blue-500/20",
                text: "text-blue-700 dark:text-blue-400",
            },
            medium: {
                bg: "bg-yellow-500/10 dark:bg-yellow-500/20",
                text: "text-yellow-700 dark:text-yellow-400",
            },
            high: {
                bg: "bg-red-500/10 dark:bg-red-500/20",
                text: "text-red-700 dark:text-red-400",
            },
        };
        return configs[priority] || configs.medium;
    };

    const getTypeConfig = (type) => {
        const configs = {
            task: {
                bg: "bg-blue-500/10 dark:bg-blue-500/20",
                text: "text-blue-700 dark:text-blue-400",
            },
            bug: {
                bg: "bg-red-500/10 dark:bg-red-500/20",
                text: "text-red-700 dark:text-red-400",
            },
            story: {
                bg: "bg-green-500/10 dark:bg-green-500/20",
                text: "text-green-700 dark:text-green-400",
            },
        };
        return configs[type] || configs.task;
    };

    const getStatusConfig = (status) => {
        const configs = {
            backlog: {
                bg: "bg-slate-500/10 dark:bg-slate-500/20",
                text: "text-slate-700 dark:text-slate-300",
                label: "Backlog",
                dot: "bg-slate-400"
            },
            todo: {
                bg: "bg-slate-500/10 dark:bg-slate-500/20",
                text: "text-slate-700 dark:text-slate-300",
                label: "To Do",
                dot: "bg-slate-400"
            },
            in_progress: {
                bg: "bg-sky-500/10 dark:bg-sky-500/20",
                text: "text-sky-700 dark:text-sky-400",
                label: "In Progress",
                dot: "bg-sky-500"
            },
            in_review: {
                bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
                text: "text-indigo-700 dark:text-indigo-400",
                label: "Review",
                dot: "bg-indigo-500"
            },
            done: {
                bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
                text: "text-emerald-700 dark:text-emerald-400",
                label: "Done",
                dot: "bg-emerald-500"
            },
        };
        return configs[status] || configs.todo;
    };

    const statusConfig = getStatusConfig(issue.status);
    const priorityConfig = getPriorityConfig(issue.priority);
    const typeConfig = getTypeConfig(issue.type);

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="border-b border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <Hash size={16} className="text-slate-400 flex-shrink-0" />
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {issue.key}
                                </span>
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                {issue.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                    <div className="space-y-5">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                                {statusConfig.label}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium ${priorityConfig.bg} ${priorityConfig.text}`}>
                                <Flag size={14} />
                                {issue.priority}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium ${typeConfig.bg} ${typeConfig.text}`}>
                                <Layers size={14} />
                                {issue.type}
                            </span>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Description
                            </h3>
                            <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 leading-relaxed whitespace-pre-wrap">
                                {issue.description || <span className="italic text-slate-500 dark:text-slate-400">No description</span>}
                            </div>
                        </div>

                        {/* Organization & Timeline Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Timeline */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        Timeline
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Start Date</p>
                                        </div>
                                        <p className={`text-sm font-medium ${issue.start_date ? 'text-slate-900 dark:text-white' : 'italic text-slate-500 dark:text-slate-400'}`}>
                                            {formatDate(issue.start_date)}
                                        </p>
                                    </div>
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Due Date</p>
                                        </div>
                                        <p className={`text-sm font-medium ${issue.due_date ? 'text-slate-900 dark:text-white' : 'italic text-slate-500 dark:text-slate-400'}`}>
                                            {formatDate(issue.due_date)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Organization */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Tag size={14} className="text-slate-500" />
                                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        Organization
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Project</p>
                                        </div>
                                        <p className={`text-sm font-medium ${issue.project?.name ? 'text-slate-900 dark:text-white' : 'italic text-slate-500 dark:text-slate-400'}`}>
                                            {issue.project?.name || "No project assigned"}
                                        </p>
                                    </div>
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Sprint</p>
                                        </div>
                                        <p className={`text-sm font-medium ${issue.sprint?.name ? 'text-slate-900 dark:text-white' : 'italic text-slate-500 dark:text-slate-400'}`}>
                                            {issue.sprint?.name || "No sprint assigned"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueOverview;
