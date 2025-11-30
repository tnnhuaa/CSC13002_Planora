/** @type {import('tailwindcss').Config} */
export default {
  // Dòng quan trọng nhất để tính năng Dark Mode bật tắt bằng nút bấm hoạt động
  darkMode: 'class', 
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}