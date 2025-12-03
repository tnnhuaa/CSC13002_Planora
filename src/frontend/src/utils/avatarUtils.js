// Generate consistent avatar color based on username
export const generateAvatarColor = (username) => {
    if (!username) return "#3b82f6"; // default blue

    const colors = [
        "#3b82f6", // blue
        "#8b5cf6", // purple
        "#ec4899", // pink
        "#f59e0b", // amber
        "#10b981", // emerald
        "#ef4444", // red
        "#06b6d4", // cyan
        "#f97316", // orange
    ];

    // Use username to consistently generate same color
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};

// Get first letter of username for avatar
export const getAvatarInitial = (username) => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
};
