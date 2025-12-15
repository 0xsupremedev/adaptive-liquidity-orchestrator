/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate"

export default {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                    50: '#fef7e6', // Preserving manual shades for legacy support if needed
                    500: '#F97316',
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                    green: '#22C55E', // Preserving existing accent colors
                    red: '#EF4444',
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Mapping old 'dark' Palette to new system approx
                dark: {
                    900: "hsl(var(--background))",
                    800: "hsl(var(--card))",
                    700: "hsl(var(--muted))",
                    400: "hsl(var(--muted-foreground))"
                }
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                "line-shadow": {
                    "0%": { "background-position": "0 0" },
                    "100%": { "background-position": "100% 100%" }
                },
                "shimmer-slide": {
                    to: { transform: "translate(calc(100cqh + 100%))" }
                },
                "spin-around": {
                    "0%": { transform: "translateZ(0) rotate(0)" },
                    "15%, 35%": { transform: "translateZ(0) rotate(90deg)" },
                    "65%, 85%": { transform: "translateZ(0) rotate(270deg)" },
                    "100%": { transform: "translateZ(0) rotate(360deg)" }
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "shimmer": "shimmer 2s infinite",
                "float": "float 6s ease-in-out infinite",
                "line-shadow": "line-shadow 15s linear infinite",
                "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
                "spin-around": "spin-around calc(var(--speed) * 2) infinite linear"
            },
        },
    },
    plugins: [animate],
}
