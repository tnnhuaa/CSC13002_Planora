import { useState, useEffect } from "react";

const DEFAULT_SETTINGS = {
    darkMode: false,
    accentColor: "Blue", // Các màu hỗ trợ: Blue, Purple, Green, Orange, Pink
    displayName: "John Doe",
    jobTitle: "Product Manager",
};

const COLOR_MAP = {
    Blue: "#2563eb",
    Purple: "#9333ea",
    Green: "#16a34a",
    Orange: "#f97316",
    Pink: "#ec4899",
};

export const useSettings = (isOpen) => {
    const [activeTab, setActiveTab] = useState("appearance");
    const [formData, setFormData] = useState(() => {
        const savedSettings = localStorage.getItem("appSettings");
        return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
    });

    // Đồng bộ state khi mở modal
    useEffect(() => {
        if (isOpen) {
            const savedSettings = localStorage.getItem("appSettings");
            if (savedSettings) {
                setFormData(JSON.parse(savedSettings));
            }
        }
    }, [isOpen]);

    // Hàm lưu cài đặt
    const handleSave = () => {
        // 1. Lưu vào LocalStorage
        localStorage.setItem("appSettings", JSON.stringify(formData));

        const colorHex = COLOR_MAP[formData.accentColor] || COLOR_MAP.Blue;
        // Gán ngay vào biến CSS --primary của thẻ html
        document.documentElement.style.setProperty("--primary", colorHex);
    };

    // Hàm reset cài đặt
    const handleReset = () => {
        if (window.confirm("Bạn có chắc muốn khôi phục cài đặt gốc?")) {
            setFormData(DEFAULT_SETTINGS);
        }
    };

    return {
        activeTab,
        setActiveTab,
        formData,
        setFormData,
        handleSave,
        handleReset,
        DEFAULT_SETTINGS,
        COLOR_MAP,
    };
};
