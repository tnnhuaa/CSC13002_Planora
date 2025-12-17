import React from "react";
import {
    Users2,
    Plus,
    Search,
    ChevronDown,
    Edit2,
    AlertCircle,
    Trash2,
    Mail,
    CheckCircle2,
} from "lucide-react";
import AddUserModal from "../../components/admin/AddUserModal";
import EditUserModal from "../../components/admin/EditUserModal";
import DeleteUserConfirmation from "../../components/admin/DeleteUserConfirmation";
import BlockUserConfirmation from "../../components/admin/BlockUserConfirmation";
import { useUserManagement } from "../../hooks/admin/useUserManagement";

const UserManagement = () => {
    const {
        loading,
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
    } = useUserManagement();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3F5F9] dark:bg-[#0F172A] flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F5F9] dark:bg-[#0F172A] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <Users2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                                Users
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                User management and permissions
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-200 dark:bg-slate-700 mb-8"></div>

                {/* User Management Section */}
                <div className="space-y-6">
                    {/* Title and Add Button */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                User Management
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                Manage system users, roles, and access control
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsAddUserModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-2xl transition-colors">
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add User</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Users */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Total Users
                            </p>
                            <p className="text-4xl font-semibold text-slate-900 dark:text-white">
                                {stats.total}
                            </p>
                        </div>

                        {/* Active Users */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Active Users
                            </p>
                            <p className="text-4xl font-semibold text-slate-900 dark:text-white">
                                {stats.active}
                            </p>
                        </div>

                        {/* Blocked Users */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Blocked Users
                            </p>
                            <p className="text-4xl font-semibold text-red-500">
                                {stats.blocked}
                            </p>
                        </div>

                        {/* Administrators */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Administrators
                            </p>
                            <p className="text-4xl font-semibold text-slate-900 dark:text-white">
                                {stats.admins}
                            </p>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Role Filter */}
                            <div className="relative">
                                <button 
                                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                    className="flex items-center justify-between w-48 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-900 dark:text-white text-sm hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
                                    <span>{selectedRole}</span>
                                    <ChevronDown className={`w-4 h-4 ml-2 text-slate-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isRoleDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg z-10">
                                        {["All Roles", "Administrator", "Team Member"].map((role) => (
                                            <button
                                                key={role}
                                                onClick={() => {
                                                    setSelectedRole(role);
                                                    setIsRoleDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                                    selectedRole === role
                                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                        : "text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600"
                                                } ${role === "All Roles" ? "border-b border-slate-200 dark:border-slate-600" : ""}`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Status Filter */}
                            <div className="relative">
                                <button 
                                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                    className="flex items-center justify-between w-48 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-900 dark:text-white text-sm hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
                                    <span>{selectedStatus}</span>
                                    <ChevronDown className={`w-4 h-4 ml-2 text-slate-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isStatusDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg z-10">
                                        {["All Status", "Active", "Blocked"].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    setSelectedStatus(status);
                                                    setIsStatusDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                                    selectedStatus === status
                                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                        : "text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600"
                                                } ${status === "All Status" ? "border-b border-slate-200 dark:border-slate-600" : ""}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                            <div className="col-span-3">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    User
                                </p>
                            </div>
                            <div className="col-span-3">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Email
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Role
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Status
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white text-right">
                                    Actions
                                </p>
                            </div>
                        </div>

                        {/* Table Body */}
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="grid grid-cols-12 gap-4 border-b border-slate-200 dark:border-slate-700 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors items-center"
                                >
                                    {/* User */}
                                    <div className="col-span-3 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                {user.avatar}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                                            {user.name}
                                        </span>
                                    </div>

                                    {/* Email */}
                                    <div className="col-span-3 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {user.email}
                                        </span>
                                    </div>

                                    {/* Role Badge */}
                                    <div className="col-span-2">
                                        <div
                                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-medium ${getRoleBadgeColor(
                                                user.role
                                            )}`}
                                        >
                                            <span className="text-lg">
                                                {getRoleBadgeIcon(user.role)}
                                            </span>
                                            {user.role}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="col-span-2">
                                        <div
                                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-medium ${getStatusBadgeColor(
                                                user.status
                                            )}`}
                                        >
                                            <CheckCircle2 className="w-3 h-3" />
                                            {user.status}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => handleEditUser(user)}
                                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleBlockUser(user)}
                                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                            <AlertCircle className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(user)}
                                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <p className="text-slate-600 dark:text-slate-400">
                                    No users found matching your search criteria.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSubmit={handleAddUser}
            />

            {/* Edit User Modal */}
            <EditUserModal
                isOpen={isEditUserModalOpen}
                user={selectedUser}
                onClose={() => {
                    setIsEditUserModalOpen(false);
                    setSelectedUser(null);
                }}
                onSubmit={handleUpdateUser}
            />

            {/* Delete User Confirmation */}
            <DeleteUserConfirmation
                isOpen={isDeleteConfirmationOpen}
                user={selectedUser}
                onClose={() => {
                    setIsDeleteConfirmationOpen(false);
                    setSelectedUser(null);
                }}
                onConfirm={handleConfirmDelete}
            />

            {/* Block User Confirmation */}
            <BlockUserConfirmation
                isOpen={isBlockConfirmationOpen}
                user={selectedUser}
                onClose={() => {
                    setIsBlockConfirmationOpen(false);
                    setSelectedUser(null);
                }}
                onConfirm={handleConfirmBlock}
            />
        </div>
    );
};

export default UserManagement;
