/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#050505', // Deep black
                foreground: '#ffffff',
                primary: {
                    DEFAULT: '#00f0ff', // Neon Blue
                    foreground: '#000000'
                },
                secondary: {
                    DEFAULT: '#7000ff', // Neon Purple
                    foreground: '#ffffff'
                },
                accent: {
                    DEFAULT: '#ff003c', // Neon Red/Pink for "Limit Break"
                    foreground: '#ffffff'
                },
                card: {
                    DEFAULT: 'rgba(255, 255, 255, 0.05)',
                    foreground: '#ffffff'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'rgba(255, 255, 255, 0.1)',
                    foreground: '#a3a3a3'
                },
                popover: {
                    DEFAULT: '#0a0a0a',
                    foreground: '#ffffff'
                },
                border: 'rgba(255, 255, 255, 0.1)',
                input: 'rgba(255, 255, 255, 0.1)',
                ring: '#00f0ff',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'], // Assuming we might add this later
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            animation: {
                "glow-pulse": "glow-pulse 3s ease-in-out infinite",
                "float": "float 6s ease-in-out infinite",
                "screen-shake": "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
            },
            keyframes: {
                "glow-pulse": {
                    "0%, 100%": { boxShadow: "0 0 10px #00f0ff, 0 0 20px #00f0ff" },
                    "50%": { boxShadow: "0 0 20px #7000ff, 0 0 40px #7000ff" },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                "shake": {
                    "10%, 90%": { transform: "translate3d(-1px, 0, 0)" },
                    "20%, 80%": { transform: "translate3d(2px, 0, 0)" },
                    "30%, 50%, 70%": { transform: "translate3d(-4px, 0, 0)" },
                    "40%, 60%": { transform: "translate3d(4px, 0, 0)" },
                }
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
}
