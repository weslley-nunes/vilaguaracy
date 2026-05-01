/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                vg: {
                    dark: '#0e4a2d',
                    light: '#e1f4e5',
                    navy: '#151c5b',
                    gold: '#f0b70c',
                    hover: '#135c38'
                }
            },
        },
    },
    plugins: [],
};
