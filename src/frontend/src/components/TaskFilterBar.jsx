import React from "react";
import { Search, ChevronDown } from "lucide-react";

function TaskFilterBar({
    searchTerm,
    filters,
    sortOrder,
    openFilter,
    setSearchTerm,
    handleFilterChange,
    setOpenFilter,
    getUniqueTypes, 
    getUniqueStatuses,
    getUniqueAssignees,
    toggleSortOrder,
    getStatusDisplay,
}) {
    return (
        <div className="flex gap-3 mb-4 flex-wrap">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                <Search size={16} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 flex-1"
                />
            </div>

            <div className="relative">
                <button
                    onClick={() =>
                        setOpenFilter(openFilter === "type" ? null : "type")
                    }
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium transition"
                >
                    {filters.type.length > 0
                        ? `Type (${filters.type.length})`
                        : "All Types"}
                    <ChevronDown size={14} />
                </button>
                {openFilter === "type" && (
                    <div className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 min-w-[200px]">
                        {getUniqueTypes().map((type) => (
                            <label
                                key={type}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer border-b border-slate-200 dark:border-slate-600 last:border-b-0"
                            >
                                <input
                                    type="checkbox"
                                    checked={filters.type.includes(type)}
                                    onChange={() =>
                                        handleFilterChange("type", type)
                                    }
                                    className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {type}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative">
                <button
                    onClick={() =>
                        setOpenFilter(openFilter === "status" ? null : "status")
                    }
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium transition"
                >
                    {filters.status.length > 0
                        ? `Status (${filters.status.length})`
                        : "All Status"}
                    <ChevronDown size={14} />
                </button>
                {openFilter === "status" && (
                    <div className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 min-w-[200px]">
                        {getUniqueStatuses().map((status) => (
                            <label
                                key={status}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer border-b border-slate-200 dark:border-slate-600 last:border-b-0"
                            >
                                <input
                                    type="checkbox"
                                    checked={filters.status.includes(status)}
                                    onChange={() =>
                                        handleFilterChange("status", status)
                                    }
                                    className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {getStatusDisplay(status)}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative">
                <button
                    onClick={() =>
                        setOpenFilter(
                            openFilter === "assignees" ? null : "assignees"
                        )
                    }
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium transition"
                >
                    {filters.assignees.length > 0
                        ? `Assignees (${filters.assignees.length})`
                        : "All Assignees"}
                    <ChevronDown size={14} />
                </button>
                {openFilter === "assignees" && (
                    <div className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 min-w-[250px]">
                        {getUniqueAssignees().map((assignee) => (
                            <label
                                key={assignee}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer border-b border-slate-200 dark:border-slate-600 last:border-b-0"
                            >
                                <input
                                    type="checkbox"
                                    checked={filters.assignees.includes(
                                        assignee
                                    )}
                                    onChange={() =>
                                        handleFilterChange("assignees", assignee)
                                    }
                                    className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {assignee}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={toggleSortOrder}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    sortOrder === null
                        ? "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                        : "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400"
                }`}
            >
                Sort{" "}
                {sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : ""}
            </button>
        </div>
    );
}

export default TaskFilterBar;