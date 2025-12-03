import React from "react";
import { Shield } from "lucide-react";
import { generateAvatarColor, getAvatarInitial } from "../../utils/avatarUtils";

const ProfileAvatar = ({ username, role, formatRole }) => {
    const avatarColor = generateAvatarColor(username);
    const firstLetter = getAvatarInitial(username);

    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-20 mb-8">
            {/* Avatar */}
            <div
                className="w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl border-4 border-white dark:border-[#1E293B]"
                style={{ backgroundColor: avatarColor }}
            >
                {firstLetter}
            </div>

            {/* Name & Role */}
            <div className="flex-1 text-center md:text-left md:mt-16">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {username}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                    <Shield size={14} />
                    {formatRole(role)}
                </div>
            </div>
        </div>
    );
};

export default ProfileAvatar;
