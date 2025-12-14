import React from "react";
import {
    LayoutGrid,
    List,
    Folder,
    Grid3x3,
    Search,
    Filter,
    Plus,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Users2,
} from "lucide-react";
import CreateIssue from "../components/CreateIssue";
import EditIssue from "../components/EditIssue";
import { useDashboard } from "../hooks/UseDashboard";

const IssueCard = ({
    projectName,
    title,
    priority,
    type,
    assignees,
    dueDate,
    onDragStart,
    isDragging,
    onClick,
}) => {
    const priorityColors = {
        Low: "bg-blue-100 border-blue-300 text-blue-700",
        High: "bg-red-100 border-red-300 text-red-700",
        Medium: "bg-yellow-100 border-yellow-300 text-yellow-700",
    };

    const typeColors = {
        Story: "bg-green-100 border-green-300 text-green-700",
        Feature: "bg-purple-100 border-purple-300 text-purple-700",
        Bug: "bg-red-100 border-red-300 text-red-700",
    };

    const dueStatusColors = {
        "Nov 29": "bg-yellow-100 border-yellow-300 text-yellow-700",
        "Due Soon": "bg-yellow-100 border-yellow-300 text-yellow-700",
    };

    return (
        <div
            draggable
            onClick={onClick}
            onDragStart={onDragStart}
            className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-all cursor-move ${
                isDragging ? "opacity-50" : ""
            }`}
        >
            <p className="text-xs font-medium text-slate-500 mb-2">
                {projectName}
            </p>
            <h4 className="text-sm font-normal text-slate-900 dark:text-white mb-3 line-clamp-2">
                {title}
            </h4>
            <div className="flex gap-2 mb-3 flex-wrap">
                <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                        priorityColors[priority] || priorityColors.Low
                    }`}
                >
                    {priority}
                </span>
                {type && (
                    <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                            typeColors[type] || typeColors.Story
                        }`}
                    >
                        {type}
                    </span>
                )}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                    {assignees?.map((initials, idx) => (
                        <div
                            key={idx}
                            className="w-6 h-6 bg-blue-600 rounded-full border border-white dark:border-slate-700 flex items-center justify-center text-xs text-white font-medium"
                        >
                            {initials}
                        </div>
                    ))}
                </div>
                {dueDate && (
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${dueStatusColors["Due Soon"]}`}
                    >
                        {dueDate}
                    </span>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, title, value, trend, isPositive }) => (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {title}
            </p>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
                <Icon size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
        </div>
        <p className="text-3xl font-medium text-slate-900 dark:text-white mb-1">
            {value}
        </p>
        <p
            className={`text-xs font-medium ${
                isPositive ? "text-green-600" : "text-red-600"
            }`}
        >
            {trend}
        </p>
    </div>
);

export default function Dashboard() {
    const {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isAddIssueModalOpen,
        setIsAddIssueModalOpen,
        selectedColumn,
        issues,
        issueToEdit,
        handleAddIssueClick,
        handleCreateIssue,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
        draggedIssue,
        getFilteredIssues,
        isEditIssueModalOpen,
        setIsEditIssueModalOpen,
        handleEditIssueClick,
        handleUpdateIssue,
    } = useDashboard();

    const filteredIssues = getFilteredIssues();

    const statData = [
        {
            icon: CheckCircle2,
            title: "Issues Completed",
            value: "48",
            trend: "+12% from last week",
            isPositive: true,
        },
        {
            icon: AlertCircle,
            title: "Pending Review",
            value: "12",
            trend: "-8% from last week",
            isPositive: false,
        },
        {
            icon: AlertCircle,
            title: "High Priority",
            value: "5",
            trend: "Urgent items",
            isPositive: false,
        },
        {
            icon: TrendingUp,
            title: "Team Velocity",
            value: "32",
            trend: "+15% from last sprint",
            isPositive: true,
        },
    ];

    const tabs = [
        { id: "kanban", label: "Kanban", icon: LayoutGrid },
        { id: "list", label: "List", icon: List },
        { id: "projects", label: "Projects", icon: Folder },
        { id: "components", label: "Components", icon: Grid3x3 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
                                Planora
                            </h1>
                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                                Modern project management for productive teams
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => handleAddIssueClick("To Do")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors w-full md:w-auto flex items-center justify-center gap-2"
                >
                    <Plus size={16} />
                    Create Issue
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statData.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === id
                                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === "kanban" && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="text"
                                placeholder="Search issues..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                            <CheckCircle2 size={16} />
                            My Issues
                        </button>
                        <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                            <Filter size={16} />
                            Priority
                        </button>
                        <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                            <Users2 size={16} />
                            Assignee
                        </button>
                    </div>

                    {/* Kanban Board */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* To Do Column */}
                        <div
                            className="bg-slate-200 dark:bg-slate-700 rounded-xl p-4 space-y-3 transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, "To Do")}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                    To Do
                                    <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs text-slate-600 dark:text-slate-400">
                                        {filteredIssues["To Do"].length}
                                    </span>
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {filteredIssues["To Do"].map((issue, idx) => {
                                    const { key, project, ...issueProps } =
                                        issue;
                                    return (
                                        <IssueCard
                                            key={idx}
                                            projectName={
                                                project?.name ||
                                                "Unknown Project"
                                            }
                                            {...issueProps}
                                            onClick={() =>
                                                handleEditIssueClick(issue)
                                            }
                                            onDragStart={(e) =>
                                                handleDragStart(
                                                    e,
                                                    issue,
                                                    "To Do"
                                                )
                                            }
                                            isDragging={
                                                draggedIssue?.key === issue.key
                                            }
                                        />
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => handleAddIssueClick("To Do")}
                                className="w-full flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Plus size={16} />
                                Add Issue
                            </button>
                        </div>

                        {/* In Progress Column */}
                        <div
                            className="bg-sky-100  dark:bg-blue-900 rounded-xl p-4 space-y-3 transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, "In Progress")}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                    In Progress
                                    <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs text-slate-600 dark:text-slate-400">
                                        {filteredIssues["In Progress"].length}
                                    </span>
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {filteredIssues["In Progress"].map(
                                    (issue, idx) => {
                                        const { key, project, ...issueProps } =
                                            issue;
                                        return (
                                            <IssueCard
                                                key={idx}
                                                projectName={
                                                    project?.name ||
                                                    "Unknown Project"
                                                }
                                                {...issueProps}
                                                onClick={() =>
                                                    handleEditIssueClick(issue)
                                                }
                                                onDragStart={(e) =>
                                                    handleDragStart(
                                                        e,
                                                        issue,
                                                        "In Progress"
                                                    )
                                                }
                                                isDragging={
                                                    draggedIssue?.key ===
                                                    issue.key
                                                }
                                            />
                                        );
                                    }
                                )}
                            </div>
                            <button
                                onClick={() =>
                                    handleAddIssueClick("In Progress")
                                }
                                className="w-full flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Plus size={16} />
                                Add Issue
                            </button>
                        </div>

                        {/* Review Column */}
                        <div
                            className="bg-indigo-100  dark:bg-indigo-800 rounded-xl p-4 space-y-3 transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, "Review")}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                    Review
                                    <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs text-slate-600 dark:text-slate-400">
                                        {filteredIssues["Review"].length}
                                    </span>
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {filteredIssues["Review"].map((issue, idx) => {
                                    const { key, project, ...issueProps } =
                                        issue;
                                    return (
                                        <IssueCard
                                            key={idx}
                                            projectName={
                                                project?.name ||
                                                "Unknown Project"
                                            }
                                            {...issueProps}
                                            onClick={() =>
                                                handleEditIssueClick(issue)
                                            }
                                            onDragStart={(e) =>
                                                handleDragStart(
                                                    e,
                                                    issue,
                                                    "Review"
                                                )
                                            }
                                            isDragging={
                                                draggedIssue?.key === issue.key
                                            }
                                        />
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => handleAddIssueClick("Review")}
                                className="w-full flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Plus size={16} />
                                Add Issue
                            </button>
                        </div>

                        {/* Done Column */}
                        <div
                            className="bg-emerald-100  dark:bg-emerald-800 rounded-xl p-4 space-y-3 transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, "Done")}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                    Done
                                    <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs text-slate-600 dark:text-slate-400">
                                        {filteredIssues["Done"].length}
                                    </span>
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {filteredIssues["Done"].map((issue, idx) => {
                                    const { key, project, ...issueProps } =
                                        issue;
                                    return (
                                        <IssueCard
                                            key={idx}
                                            projectName={
                                                project?.name ||
                                                "Unknown Project"
                                            }
                                            {...issueProps}
                                            onClick={() =>
                                                handleEditIssueClick(issue)
                                            }
                                            onDragStart={(e) =>
                                                handleDragStart(
                                                    e,
                                                    issue,
                                                    "Done"
                                                )
                                            }
                                            isDragging={
                                                draggedIssue?.key === issue.key
                                            }
                                        />
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => handleAddIssueClick("Done")}
                                className="w-full flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Plus size={16} />
                                Add Issue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== "kanban" && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400">
                        {tabs.find((t) => t.id === activeTab)?.label} view
                        coming soon
                    </p>
                </div>
            )}

            {/* Add Issue Modal */}
            <CreateIssue
                isOpen={isAddIssueModalOpen}
                onClose={() => setIsAddIssueModalOpen(false)}
                onCreateIssue={handleCreateIssue}
                column={selectedColumn}
            />

            {/* Edit Issue Modal */}
            <EditIssue
                isOpen={isEditIssueModalOpen}
                onClose={() => setIsEditIssueModalOpen(false)}
                issueData={issueToEdit} // Pass the issue data
                onUpdateIssue={handleUpdateIssue} // Pass the update handler from the hook
            />
        </div>
    );
}
