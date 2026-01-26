/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#0f172a',    // Slate 900
                'bg-card': '#1e293b',       // Slate 800
                'text-primary': '#f8fafc',  // Slate 50
                'text-secondary': '#94a3b8',// Slate 400
                'accent': '#3b82f6',        // Blue 500
                'accent-hover': '#2563eb',  // Blue 600
                'success': '#22c55e',       // Green 500
                'error': '#ef4444',         // Red 500
            }
        },
    },
    plugins: [],
}
