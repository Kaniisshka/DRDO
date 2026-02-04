/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#F8FAFC',    // Very Light Gray
                'bg-card': '#FFFFFF',       // Pure White
                'text-primary': '#1F2937',  // Dark Charcoal
                'text-secondary': '#4B5563',// Slate Gray
                'accent': '#1E3A8A',        // Navy Blue
                'accent-hover': '#1E40AF',  // Navy Blue Hover
                'success': '#22c55e',       // Green 500
                'error': '#ef4444',         // Red 500
            }
        },
    },
    plugins: [],
}
