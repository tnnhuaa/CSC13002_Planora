import { useState, useMemo } from "react";

export const UseTaskFilter = (tasks = []) => {
    const [searchTerm, setSearchTerm] = useState("");
    
    const [filters, setFilters] = useState({
        type: [], 
        priority: [],
        assignees: [],
    });
    const [sortOrder, setSortOrder] = useState(null);
    const [openFilter, setOpenFilter] = useState(null);

    const getTimeValue = (dateString) => {
        if (!dateString) return -1; 
        if (dateString === "Due Soon") return -1;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return -1;
        return date.getTime();
    };

    const performFullTextSearch = (tasksToSearch, searchQuery) => {
        if (!searchQuery.trim()) return tasksToSearch;

        const query = searchQuery.toLowerCase();
        return tasksToSearch.filter((task) => {
            const matchesTitle = task.title?.toLowerCase().includes(query);
            const matchesTaskId = task.issueId?.toLowerCase().includes(query); 
            const matchesAssignee = task.assignee?.username?.toLowerCase().includes(query);
            return matchesTitle || matchesTaskId || matchesAssignee;
        });
    };

    const applyFilters = (tasksToFilter, filterObj) => {
        return tasksToFilter.filter((task) => {
            const matchesType = filterObj.type.length === 0 || 
                (task.type && filterObj.type.includes(task.type));

            const matchesPriority = filterObj.priority.length === 0 || 
                filterObj.priority.includes(task.priority);

            const matchesAssignees = filterObj.assignees.length === 0 || 
                (task.assignee?.username && filterObj.assignees.includes(task.assignee.username));

            return matchesType && matchesPriority && matchesAssignees;
        });
    };

    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => {
            const currentValues = prev[filterType];
            const newValues = currentValues.includes(value)
                ? currentValues.filter((v) => v !== value)
                : [...currentValues, value];

            return { ...prev, [filterType]: newValues };
        });
    };

    const applySortByDueDate = (tasksToSort, order) => {
        if (!order) return tasksToSort;
        return [...tasksToSort].sort((a, b) => {
            const timeA = getTimeValue(a.due_date);
            const timeB = getTimeValue(b.due_date);
            
            if (timeA === -1 && timeB !== -1) return 1;
            if (timeA !== -1 && timeB === -1) return -1;
            if (timeA === -1 && timeB === -1) return 0;

            return order === "asc" ? timeA - timeB : timeB - timeA;
        });
    };

    const toggleSortOrder = () => {
        setSortOrder((prev) =>
            prev === null ? "asc" : prev === "asc" ? "desc" : null
        );
    };

    const getUniqueTypes = () => {
        const types = tasks.map((task) => task.type).filter(Boolean);
        return [...new Set(types)].sort();
    };

    const getUniquePriorities = () => {
        return ["low", "medium", "high"];
    };

    const getUniqueAssignees = () => {
        const assignees = tasks.map((task) => task.assignee?.username).filter(Boolean);
        return [...new Set(assignees)].sort();
    };

    const getPriorityDisplay = (priority) => {
        const map = {
            low: "Low",
            medium: "Medium",
            high: "High"
        };
        return map[priority] || priority;
    };

    const filteredAndSortedTasks = useMemo(() => {
        let result = tasks;
        
        result = performFullTextSearch(result, searchTerm);
        
        result = applyFilters(result, filters);
        
        result = applySortByDueDate(result, sortOrder);
        
        return result;
    }, [tasks, searchTerm, filters, sortOrder]);

    return {
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
        getPriorityDisplay 
    };
};