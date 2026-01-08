import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
    ChartNoAxesGantt,
    FolderKanban,
    ChevronDown,
} from "lucide-react";
import EditIssue from "../components/EditIssue";
import IssueOverview from "../components/IssueOverview";
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
        low: "bg-blue-100 border-blue-300 text-blue-700",
        high: "bg-red-100 border-red-300 text-red-700",
        medium: "bg-yellow-100 border-yellow-300 text-yellow-700",
    };

    const typeColors = {
        story: "bg-green-100 border-green-300 text-green-700",
        task: "bg-blue-100 border-blue-300 text-blue-700",
        bug: "bg-red-100 border-red-300 text-red-700",
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
                            className="w-6 h-6 bg-primary rounded-full border border-white dark:border-slate-700 flex items-center justify-center text-xs text-white font-medium"
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

const StatCard = ({ icon, title, value, trend, isPositive }) => {
    const Icon = icon;
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {title}
                </p>
                <div className="bg-primary/30 dark:bg-primary/30 p-2 rounded-xl">
                    <Icon size={18} className="text-primary dark:text-primary" />
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
};

const ProjectCard = ({ project, onClick }) => {
    // Progress comes from backend
    const progress = project.progress || 0;

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                        {project.name}
                    </h3>
                    {project.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                            {project.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Progress
                    </span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const navigate = useNavigate();
    const {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        issues,
        issueToEdit,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
        draggedIssue,
        getFilteredIssues,
        isEditIssueModalOpen,
        setIsEditIssueModalOpen,
        handleShowIssueOverview,
        handleUpdateIssue,
        isIssueOverviewOpen,
        setIsIssueOverviewOpen,
        issueForOverview,
        selectedProjects,
        setSelectedProjects,
        selectedSprints,
        setSelectedSprints,
        projects,
        sprints,
    } = useDashboard();

    const filteredIssues = getFilteredIssues();

    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [isSprintDropdownOpen, setIsSprintDropdownOpen] = useState(false);

    const projectDropdownRef = useRef(null);
    const sprintDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
                setIsProjectDropdownOpen(false);
            }
            if (sprintDropdownRef.current && !sprintDropdownRef.current.contains(event.target)) {
                setIsSprintDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Calculate statistics from issues
    const allIssues = [
        ...issues["To Do"],
        ...issues["In Progress"],
        ...issues.Review,
        ...issues.Done,
    ];

    const completedCount = issues.Done.length;
    const bugCount = allIssues.filter(
        (issue) => issue.type === "bug" && issue.status !== "done"
    ).length;
    const highPriorityCount = allIssues.filter(
        (issue) => issue.priority === "high" && issue.status !== "done"
    ).length;
    const uniqueProjects = new Set(
        allIssues.map((issue) => issue.project?._id).filter(Boolean)
    );
    const projectCount = uniqueProjects.size;

    const statData = [
        {
            icon: CheckCircle2,
            title: "Tasks Completed",
            value: completedCount,
            trend: "Done status",
            isPositive: true,
        },
        {
            icon: AlertCircle,
            title: "Bug Tasks",
            value: bugCount,
            trend: "Type: Bug",
            isPositive: false,
        },
        {
            icon: AlertCircle,
            title: "High Priority",
            value: highPriorityCount,
            trend: "Urgent items",
            isPositive: false,
        },
        {
            icon: Folder,
            title: "Projects",
            value: projectCount,
            trend: "Participating",
            isPositive: true,
        },
    ];

    const tabs = [
        { id: "kanban", label: "Kanban", icon: LayoutGrid },
        // { id: "list", label: "List", icon: List },
        { id: "projects", label: "Projects", icon: Folder },
        // { id: "components", label: "Components", icon: Grid3x3 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
                                Dashboard
                            </h1>
                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                                Overview of your tasks and projects
                            </p>
                        </div>
                    </div>
                </div>
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
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Project Filter Dropdown */}
                        <div className="relative" ref={projectDropdownRef}>
                            <button
                                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <FolderKanban size={16} />
                                Project ({selectedProjects.length === 0 ? 'All' : selectedProjects.length})
                                <ChevronDown size={14} className={`transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isProjectDropdownOpen && (
                                <div className="absolute top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 min-w-[150px] max-h-60 overflow-y-auto">
                                    {projects.map((project) => (
                                        <label key={project._id} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedProjects.includes(project._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedProjects([...selectedProjects, project._id]);
                                                    } else {
                                                        setSelectedProjects(selectedProjects.filter(id => id !== project._id));
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            <span className="text-sm text-slate-900 dark:text-white">{project.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sprint Filter Dropdown */}
                        <div className="relative" ref={sprintDropdownRef}>
                            <button
                                onClick={() => setIsSprintDropdownOpen(!isSprintDropdownOpen)}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <ChartNoAxesGantt size={16} />
                                Sprint ({selectedProjects.length === 0 ? 'All' : selectedProjects.length})
                                <ChevronDown size={14} className={`transition-transform ${isSprintDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isSprintDropdownOpen && (
                                <div className="absolute top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 min-w-[150px] max-h-60 overflow-y-auto">
                                    {sprints.map((sprint) => (
                                        <label key={sprint._id} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedSprints.includes(sprint._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedSprints([...selectedSprints, sprint._id]);
                                                    } else {
                                                        setSelectedSprints(selectedSprints.filter(id => id !== sprint._id));
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            <span className="text-sm text-slate-900 dark:text-white">{sprint.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
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
                                                handleShowIssueOverview(issue)
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
                                                    handleShowIssueOverview(
                                                        issue
                                                    )
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
                                                handleShowIssueOverview(issue)
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
                                                handleShowIssueOverview(issue)
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
                        </div>
                    </div>
                </div>
            )}

            {/* Projects Tab */}
            {activeTab === "projects" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                onClick={() => navigate(`/projects/${project._id}`)}
                            />
                        ))}
                    </div>
                    {projects.length === 0 && (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                            <p className="text-slate-500 dark:text-slate-400">
                                No projects found
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Other Views */}
            {activeTab !== "kanban" && activeTab !== "projects" && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400">
                        {tabs.find((t) => t.id === activeTab)?.label} view
                        coming soon
                    </p>
                </div>
            )}

            {/* Issue Overview Modal */}
            <IssueOverview
                isOpen={isIssueOverviewOpen}
                issue={issueForOverview}
                onClose={() => setIsIssueOverviewOpen(false)}
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
