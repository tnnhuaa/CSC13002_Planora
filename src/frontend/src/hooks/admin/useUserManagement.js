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
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
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
          role: user.role === "admin" ? "Administrator" : "User",
          status: user.status === "banned" ? "Blocked" : "Active",
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
      User: "bg-green-100 text-green-800",
      Administrator: "bg-purple-100 text-purple-800",
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
      User: "●",
      Administrator: "●",
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
  const handleAddUser = async (newUserFromBackend) => {
    try {
      const newUser = newUserFromBackend.data || newUserFromBackend;
      console.log(newUser);
      // 2. SAFETY CHECK: Ensure we actually have a user object
      if (!newUser || !newUser._id) {
        throw new Error("Invalid user data received from server");
      }
      // Update Local State (Avoid refetching for speed)
      const mappedUser = {
        id: newUser._id,
        name: newUser.fullName || newUser.username,
        email: newUser.email,
        role: newUser.role === "admin" ? "Administrator" : "User",
        status: newUser.status === "banned" ? "Blocked" : "Active",
        avatar: (newUser.fullName || newUser.username || "NA")
          .substring(0, 2)
          .toUpperCase(),
      };

      setUsers((prevUsers) => [...prevUsers, mappedUser]);
      setIsAddUserModalOpen(false);
      return { success: true };
    } catch (err) {
      alert(err.message || "Failed to create user");
      return { success: false, error: err.message };
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      if (!selectedUser) return;

      const backendUser = updatedUser.data || updatedUser;

      const mappedUser = {
        ...selectedUser, // Keep existing ID, Avatar, etc.
        name: backendUser.fullName || backendUser.name || selectedUser.name,
        email: backendUser.email || selectedUser.email,
        role: backendUser.role === "admin" ? "Administrator" : "User",
      };

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === selectedUser.id ? mappedUser : u))
      );

      setIsEditUserModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      alert(err.message || "Failed to update user");
      return { success: false, error: err.message };
    }
  };

  const handleConfirmDelete = async (userId) => {
    try {
      // Remove from list
      setUsers(users.filter((u) => u.id !== userId));
      setIsDeleteConfirmationOpen(false);
      setSelectedUser(null);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const handleConfirmBlock = async (userId) => {
    try {
      setUsers(
        users.map((u) => {
          if (u.id === userId) {
            const newStatus = u.status === "Active" ? "Blocked" : "Active";
            return { ...u, status: newStatus };
          }
          return u;
        })
      );

      setIsBlockConfirmationOpen(false);
      setSelectedUser(null);
      return { success: true };
    } catch (err) {
      alert(err.message || "Failed to change user status");
      return { success: false, error: err.message };
    }
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
