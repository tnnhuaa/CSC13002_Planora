import React, { useState, useEffect } from 'react';
import { X, Moon, Palette, Bell, Monitor, Sliders, Check } from 'lucide-react'; 

const DEFAULT_SETTINGS = {
  darkMode: false,
  accentColor: 'Blue', // Các màu hỗ trợ: Blue, Purple, Green, Orange, Pink
  displayName: 'John Doe',
  jobTitle: 'Product Manager'
};

const COLOR_MAP = {
  Blue: '#2563eb',
  Purple: '#9333ea',
  Green: '#16a34a',
  Orange: '#f97316',
  Pink: '#ec4899',
};

// Định nghĩa danh sách màu để render ra giao diện
const COLORS = [
  { name: 'Blue', class: 'bg-blue-600', ring: 'ring-blue-600' },
  { name: 'Purple', class: 'bg-purple-600', ring: 'ring-purple-600' },
  { name: 'Green', class: 'bg-green-600', ring: 'ring-green-600' },
  { name: 'Orange', class: 'bg-orange-500', ring: 'ring-orange-500' },  
  { name: 'Pink', class: 'bg-pink-500', ring: 'ring-pink-500' },       
];

const SettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('appearance');

  // State
  const [formData, setFormData] = useState(() => {
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
  });

  // Đồng bộ state khi mở modal
  useEffect(() => {
    if (isOpen) {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        setFormData(JSON.parse(savedSettings));
      }
    }
  }, [isOpen]);

  // --- HÀM LƯU QUAN TRỌNG ---
  const handleSave = () => {
    // 1. Lưu vào LocalStorage
    localStorage.setItem('appSettings', JSON.stringify(formData));
    
    // 2. Áp dụng Dark Mode ngay lập tức
    if (formData.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const colorHex = COLOR_MAP[formData.accentColor] || COLOR_MAP.Blue;
    // Gán ngay vào biến CSS --primary của thẻ html
    document.documentElement.style.setProperty('--primary', colorHex);
    
    // (Lưu ý: Accent Color hiện tại chỉ lưu chuỗi, chưa đổi màu toàn app vì cần cấu hình CSS Variable phức tạp hơn, tạm thời ta làm UI trước)
    onClose();
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc muốn khôi phục cài đặt gốc?")) {
      setFormData(DEFAULT_SETTINGS);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up transition-colors duration-300">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-start shrink-0 bg-white dark:bg-slate-900 z-10 transition-colors">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-xl">⚙️</span> Settings
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your Planora experience.</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* TABS */}
        <div className="px-6 pt-2 shrink-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {['Appearance', 'Notifications', 'Display', 'Preferences'].map((tab) => (
               <TabItem 
                key={tab}
                label={tab} 
                isActive={activeTab === tab.toLowerCase()} 
                onClick={() => setActiveTab(tab.toLowerCase())} 
              />
            ))}
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white dark:bg-slate-900 transition-colors">
          {activeTab === 'appearance' && (
            <div className="space-y-8">
              
              {/* --- Dark Mode Toggle --- */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</h3>
                <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between bg-white dark:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                      <Moon size={20} className="text-gray-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
                    </div>
                  </div>
                  
                  {/* Custom Toggle Switch */}
                  <button 
                    onClick={() => setFormData({...formData, darkMode: !formData.darkMode})}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${formData.darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${formData.darkMode ? 'translate-x-6' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

                {/* --- Accent Color Selection (New Design) --- */}
                <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between mt-3 bg-white dark:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                      <Palette size={20} className="text-gray-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Accent Color</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Choose your primary accent color</p>
                    </div>
                  </div>
                  
                  {/* Color Swatches */}
                  <div className="flex gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setFormData({...formData, accentColor: color.name})}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${color.class} 
                          ${formData.accentColor === color.name 
                            ? `ring-2 ring-offset-2 ${color.ring} ring-offset-white dark:ring-offset-slate-800 scale-110` 
                            : 'hover:scale-110 opacity-70 hover:opacity-100'
                          }`}
                        title={color.name}
                      >
                        {formData.accentColor === color.name && (
                          <Check size={14} className="text-white font-bold" strokeWidth={3} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personalization Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Personalization</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Display Name</label>
                  <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Job Title</label>
                  <input 
                    type="text" 
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                    className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all"
                  />
                </div>
              </div>

            </div>
          )}
          
          {/* Placeholder for other tabs */}
          {activeTab !== 'appearance' && (
             <div className="flex flex-col items-center justify-center h-60 text-center space-y-3">
               <Sliders size={48} className="text-gray-300 dark:text-slate-600" />
               <p className="text-gray-500 dark:text-gray-400">Settings for <span className="font-semibold capitalize">{activeTab}</span> are coming soon!</p>
             </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 shrink-0 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900 transition-colors">
          <button 
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex gap-3">
             <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 dark:shadow-none transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const TabItem = ({ label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-1 ${
      isActive 
        ? 'text-gray-900 dark:text-white border-blue-600' 
        : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
    }`}
  >
    {label}
  </button>
);

export default SettingsModal;