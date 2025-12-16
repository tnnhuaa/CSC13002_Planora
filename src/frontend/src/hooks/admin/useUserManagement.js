import { useState, useEffect } from "react";
import { userService } from "../../services/userService";

export const useUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("All Roles");
    const [selectedStatus, setSelectedStatus] = useState("All Status");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [isBlockConfirmationOpen, setIsBlockConfirmationOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    // Fetch users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const assigneesData = await userService.getAllUser();

                const transformedUsers = assigneesData.data.map((user) => ({
                    id: user._id,
                    name: user.username,
                    email: user.email,
                    role: user.role === "admin" ? "Administrator" : "Team Member",
                    status: "Active",
                    avatar: user.username.substring(0, 2).toUpperCase(),
                }));

                setUsers(transformedUsers);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError(err.message || "Failed to fetch users");
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on search and filters
    useEffect(() => {
        let filtered = users.filter((user) => {
            const matchesSearch =
                searchTerm === "" ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole =
                selectedRole === "All Roles" || user.role === selectedRole;

            const matchesStatus =
                selectedStatus === "All Status" || user.status === selectedStatus;

            return matchesSearch && matchesRole && matchesStatus;
        });

        setFilteredUsers(filtered);
    }, [users, searchTerm, selectedRole, selectedStatus]);

    const stats = {
        total: users.length,
        active: users.filter((u) => u.status === "Active").length,
        blocked: users.filter((u) => u.status === "Blocked").length,
        admins: users.filter((u) => u.role === "Administrator").length,
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            "Project Manager": "bg-blue-100 text-blue-800",
            "Team Member": "bg-green-100 text-green-800",
            "Administrator": "bg-purple-100 text-purple-800",
        };
        return colors[role] || "bg-gray-100 text-gray-800";
    };

    const getStatusBadgeColor = (status) => {
        return status === "Active"
            ? "bg-blue-100 text-blue-800"
            : "bg-red-100 text-red-800";
    };

    const getRoleBadgeIcon = (role) => {
        const icons = {
            "Project Manager": "●",
            "Team Member": "●",
            "Administrator": "●",
        };
        return icons[role] || "●";
    };

    // Modal and action handlers
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditUserModalOpen(true);
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setIsDeleteConfirmationOpen(true);
    };

    const handleBlockUser = (user) => {
        setSelectedUser(user);
        setIsBlockConfirmationOpen(true);
    };
    
    // Update, Delete, and Block handlers 
    // 
    //An thêm đây -----------------------
    //
    const handleAddUser = (newUser) => {
        setUsers([...users, newUser]);
        setIsAddUserModalOpen(false);
    };

    const handleUpdateUser = (updatedUser) => {
        setUsers(
            users.map((u) =>
                u.id === updatedUser.id
                    ? {
                          ...u,
                          name: updatedUser.name,
                          email: updatedUser.email,
                          role: updatedUser.role,
                          status: updatedUser.status,
                      }
                    : u
            )
        );
        setIsEditUserModalOpen(false);
        setSelectedUser(null);
    };

    const handleConfirmDelete = (userId) => {
        setUsers(users.filter((u) => u.id !== userId));
        setIsDeleteConfirmationOpen(false);
        setSelectedUser(null);
    };

    const handleConfirmBlock = (userId) => {
        setUsers(
            users.map((u) =>
                u.id === userId ? { ...u, status: "Blocked" } : u
            )
        );
        setIsBlockConfirmationOpen(false);
        setSelectedUser(null);
    };

    return {
        users,
        loading,
        error,
        searchTerm,
        selectedRole,
        selectedStatus,
        filteredUsers,
        isAddUserModalOpen,
        isEditUserModalOpen,
        isDeleteConfirmationOpen,
        isBlockConfirmationOpen,
        selectedUser,
        isRoleDropdownOpen,
        isStatusDropdownOpen,
        setSearchTerm,
        setSelectedRole,
        setSelectedStatus,
        setIsAddUserModalOpen,
        setIsEditUserModalOpen,
        setIsDeleteConfirmationOpen,
        setIsBlockConfirmationOpen,
        setSelectedUser,
        setIsRoleDropdownOpen,
        setIsStatusDropdownOpen,
        stats,
        getRoleBadgeColor,
        getStatusBadgeColor,
        getRoleBadgeIcon,
        handleAddUser,
        handleEditUser,
        handleUpdateUser,
        handleDeleteUser,
        handleConfirmDelete,
        handleBlockUser,
        handleConfirmBlock,
    };
};
