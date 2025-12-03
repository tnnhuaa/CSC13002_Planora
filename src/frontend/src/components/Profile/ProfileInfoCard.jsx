import React from "react";

const ProfileInfoCard = ({ icon: Icon, label, value }) => {
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Icon size={16} />
                {label}
            </label>
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white font-medium">
                {value}
            </div>
        </div>
    );
};

export default ProfileInfoCard;
