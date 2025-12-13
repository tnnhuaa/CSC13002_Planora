import { useState, useMemo } from "react";

/**
 * Custom Hook for Task Filtering, Searching, and Sorting
 * Manages: search term, filters (sprint, status, assignees), sort order
 * Returns: filtered/sorted tasks + filter state management functions
 */
export const UseTaskFilter = (tasks = []) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        sprint: [],
        status: [],
        assignees: [],
    });
    const [sortOrder, setSortOrder] = useState(null); // null | 'asc' | 'desc'
    const [openFilter, setOpenFilter] = useState(null); // track which filter dropdown is open

    // ========== SEARCH FUNCTIONS ==========

    /**
     * Perform full-text search on tasks
     * Searches in: title, taskId, assignee.username
     */
    const performFullTextSearch = (tasksToSearch, searchQuery) => {
        if (!searchQuery.trim()) return tasksToSearch;

        const query = searchQuery.toLowerCase();
        return tasksToSearch.filter((task) => {
            const matchesTitle = task.title.toLowerCase().includes(query);
            const matchesTaskId = task.taskId.toLowerCase().includes(query);
            const matchesAssignee = task.assignee?.username
                .toLowerCase()
                .includes(query);
            return matchesTitle || matchesTaskId || matchesAssignee;
        });
    };

    // ========== FILTER FUNCTIONS ==========

    /**
     * Apply filters with AND logic between different filter types
     * OR logic within the same filter type
     */
    const applyFilters = (tasksToFilter, filterObj) => {
        return tasksToFilter.filter((task) => {
            // Sprint filter: OR logic (if sprint array is empty, all tasks pass)
            if (filterObj.sprint.length > 0) {
                if (!filterObj.sprint.includes(task.sprint)) return false;
            }

            // Status filter: OR logic
            if (filterObj.status.length > 0) {
                if (!filterObj.status.includes(task.status)) return false;
            }

            // Assignees filter: OR logic
            if (filterObj.assignees.length > 0) {
                if (!filterObj.assignees.includes(task.assignee?.username)) {
                    return false;
                }
            }

            return true;
        });
    };

    /**
     * Handle filter checkbox changes
     */
    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => {
            const currentValues = prev[filterType];
            const newValues = currentValues.includes(value)
                ? currentValues.filter((v) => v !== value)
                : [...currentValues, value];

            return {
                ...prev,
                [filterType]: newValues,
            };
        });
    };

    // ========== SORT FUNCTIONS ==========

    /**
     * Sort tasks by due date
     */
    const applySortByDueDate = (tasksToSort, order) => {
        if (!order) return tasksToSort; // No sort if order is null

        const sorted = [...tasksToSort].sort((a, b) => {
            const dateA = new Date(a.dueDate).getTime();
            const dateB = new Date(b.dueDate).getTime();

            return order === "asc" ? dateA - dateB : dateB - dateA;
        });

        return sorted;
    };

    /**
     * Toggle sort order: null -> asc -> desc -> null
     */
    const toggleSortOrder = () => {
        setSortOrder((prev) =>
            prev === null ? "asc" : prev === "asc" ? "desc" : null
        );
    };

    // ========== UTILITY FUNCTIONS ==========

    /**
     * Get all unique values for filter dropdowns
     */
    const getUniqueSprints = () => {
        const sprints = tasks.map((task) => task.sprint);
        return [...new Set(sprints)].filter(Boolean).sort();
    };

    const getUniqueStatuses = () => {
        return ["todo", "in_progress", "review", "done"];
    };

    const getUniqueAssignees = () => {
        const assignees = tasks.map((task) => task.assignee?.username);
        return [...new Set(assignees)].filter(Boolean).sort();
    };

    /**
     * Format date for display
     */
    const formatDateDisplay = (isoDate) => {
        if (!isoDate) return "No due date";
        const date = new Date(isoDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return "Tomorrow";
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    /**
     * Get date color based on due date
     */
    const getDateColor = (isoDate) => {
        if (!isoDate) {
            return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600";
        }

        const dueDate = new Date(isoDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        const timeDiff = dueDate - today;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff < 0) {
            // Overdue
            return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700";
        } else if (daysDiff <= 2) {
            // Due soon (0-2 days)
            return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700";
        }

        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600";
    };

    // ========== MAIN FILTERING LOGIC ==========

    /**
     * Main function: combine search, filter, and sort
     * Using useMemo to optimize performance
     */
    const filteredAndSortedTasks = useMemo(() => {
        let result = tasks;

        // Step 1: Apply search
        result = performFullTextSearch(result, searchTerm);

        // Step 2: Apply filters
        result = applyFilters(result, filters);

        // Step 3: Apply sort
        result = applySortByDueDate(result, sortOrder);

        return result;
    }, [tasks, searchTerm, filters, sortOrder]);

    // ========== RETURN STATE & FUNCTIONS ==========

    return {
        // State
        searchTerm,
        filters,
        sortOrder,
        openFilter,
        filteredAndSortedTasks,

        // Search
        setSearchTerm,

        // Filter
        handleFilterChange,
        setOpenFilter,
        getUniqueSprints,
        getUniqueStatuses,
        getUniqueAssignees,

        // Sort
        setSortOrder,
        toggleSortOrder,

        // Utilities
        formatDateDisplay,
        getDateColor,
    };
};
