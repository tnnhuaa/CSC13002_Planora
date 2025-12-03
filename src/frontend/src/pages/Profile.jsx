import React from "react";
import { User, Mail, Shield, Calendar } from "lucide-react";
import UseProfile from "../hooks/UseProfile";
import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileAvatar from "../components/Profile/ProfileAvatar";
import ProfileInfoCard from "../components/Profile/ProfileInfoCard";

const Profile = () => {
    const { userData, isLoading, error, formatRole, formatDate } = UseProfile();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F3F5F9] dark:bg-[#0F172A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F3F5F9] dark:bg-[#0F172A] flex items-center justify-center p-4">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F5F9] dark:bg-[#0F172A] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <ProfileHeader />

                {/* Profile Card */}
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Banner */}
                    <div className="h-32 bg-slate-400"></div>

                    {/* Content */}
                    <div className="p-6 md:p-8">
                        {/* Avatar & Basic Info */}
                        <ProfileAvatar
                            username={userData?.username}
                            role={userData?.role}
                            formatRole={formatRole}
                        />

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <ProfileInfoCard
                                icon={User}
                                label="Username"
                                value={userData?.username}
                            />
                            <ProfileInfoCard
                                icon={Mail}
                                label="Email"
                                value={userData?.email}
                            />
                            <ProfileInfoCard
                                icon={Shield}
                                label="Role"
                                value={formatRole(userData?.role)}
                            />
                            <ProfileInfoCard
                                icon={Calendar}
                                label="Member Since"
                                value={formatDate(userData?.createdAt)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
