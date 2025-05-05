
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				video: {
					primary: '#3B82F6', // Changed to blue
					secondary: '#2563EB', // Changed to darker blue
					accent: '#93C5FD', // Light blue
					muted: '#EFF6FF', // Very light blue
					danger: '#ea384c', // Keep red for danger
					dark: '#1A1F2C', // Changed to white
				  },
				brand: {
					'blue': '#4361ee',
					'blue-light': '#4895ef',
					'blue-dark': '#3f37c9',
					'purple': '#7209b7',
					'pink': '#f72585',
					'gray': '#6c757d'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				"accordion-down": {
				  from: { height: '0' },
				  to: { height: 'var(--radix-accordion-content-height)' }
				},
				"accordion-up": {
				  from: { height: 'var(--radix-accordion-content-height)' },
				  to: { height: '0' }
				},
				"fade-in": {
				  "0%": { opacity: "0" },
				  "100%": { opacity: "1" }
				},
				"fade-out": {
				  "0%": { opacity: "1" },
				  "100%": { opacity: "0" }
				},
				"scale-in": {
				  "0%": { transform: "scale(0.9)", opacity: "0" },
				  "100%": { transform: "scale(1)", opacity: "1" }
				},
				"slide-up": {
				  "0%": { transform: "translateY(20px)", opacity: "0" },
				  "100%": { transform: "translateY(0)", opacity: "1" }
				},
				"slide-down": {
				  "0%": { transform: "translateY(-20px)", opacity: "0" },
				  "100%": { transform: "translateY(0)", opacity: "1" }
				},
				"pulse-ring": {
				  "0%": { transform: "scale(0.8)", opacity: "0" },
				  "50%": { opacity: "0.5" },
				  "100%": { transform: "scale(1.5)", opacity: "0" }
				},
				"speaking-pulse": {
                    "0%, 100%": { boxShadow: "0 0 0 0 rgba(155, 135, 245, 0.4)" },
                    "70%": { boxShadow: "0 0 0 12px rgba(155, 135, 245, 0)" },
				},
				vibrate: {
					'0%': { transform: 'translate(0)' },
					'20%': { transform: 'translate(-2px, 2px)' },
					'40%': { transform: 'translate(-2px, -2px)' },
					'60%': { transform: 'translate(2px, 2px)' },
					'80%': { transform: 'translate(2px, -2px)' },
					'100%': { transform: 'translate(0)' },
				  },

				// "accordion-down": {
                //     from: { height: "0" },
                //     to: { height: "var(--radix-accordion-content-height)" },
                // },
			},
			animation: {
				"speaking-pulse": "speaking-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-in-out',
				'fade-out': 'fade-out 0.3s ease-in-out',
				"scale-in": "scale-in 0.4s ease-out forwards",
				"slide-up": "slide-up 0.4s ease-out forwards",
				"slide-down": "slide-down 0.4s ease-out forwards",
				"pulse-ring": "pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite",
				'vibrate': 'vibrate 0.3s linear infinite',
			},
			backgroundImage: {
				'hero-pattern': 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
