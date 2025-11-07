import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 * 
 * This configuration centralizes all theme colors for the mini app.
 * To change the app's color scheme, simply update the 'primary' color value below.
 * 
 * Example theme changes:
 * - Blue theme: primary: "#3182CE"
 * - Green theme: primary: "#059669" 
 * - Red theme: primary: "#DC2626"
 * - Orange theme: primary: "#EA580C"
 */
export default {
    darkMode: "media",
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
		extend: {
			colors: {
				// Main theme color - sunrise apricot palette
				primary: {
					DEFAULT: "#FF7A3D",
					50: "#FFF6EF",
					100: "#FFE7D6",
					200: "#FFCFAD",
					300: "#FFB385",
					400: "#FF9861",
					500: "#FF7A3D",
					600: "#F0642D",
					700: "#D25220",
					800: "#A13C16",
					900: "#6F2810",
				},
				"primary-light": "#FF9861",
				"primary-dark": "#D25220",
				// Accent palette for orchid highlights
				accent: {
					DEFAULT: "#8A68FF",
					50: "#F4F1FF",
					100: "#E7DEFF",
					200: "#CFC0FF",
					300: "#B49DFF",
					400: "#9B7EFF",
					500: "#8A68FF",
					600: "#704CF2",
					700: "#5736D6",
					800: "#3E259B",
					900: "#27176B",
				},
				// Secondary colors for backgrounds and text
				secondary: "#FFF9F3",
				"secondary-dark": "#1F2933",
				// Semantic colors
				success: "#10B981",
				error: "#EF4444",
				warning: "#F59E0B",
				info: "#3B82F6",
				// Legacy CSS variables for backward compatibility
				background: 'var(--background)',
				foreground: 'var(--foreground)'
			},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		// Custom spacing for consistent layout
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  		},
  		// Custom container sizes
  		maxWidth: {
  			'xs': '20rem',
  			'sm': '24rem',
  			'md': '28rem',
  			'lg': '32rem',
  			'xl': '36rem',
  			'2xl': '42rem',
  		},
  		// Custom animations for skeleton loading and interactions
  		animation: {
  			shimmer: 'shimmer 2s infinite',
  			'fade-in': 'fadeIn 0.3s ease-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'scale-in': 'scaleIn 0.2s ease-out',
  		},
  		keyframes: {
  			shimmer: {
  				'0%': { transform: 'translateX(-100%)' },
  				'100%': { transform: 'translateX(100%)' },
  			},
  			fadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			slideUp: {
  				'0%': { transform: 'translateY(8px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' },
  			},
  			scaleIn: {
  				'0%': { transform: 'scale(0.95)', opacity: '0' },
  				'100%': { transform: 'scale(1)', opacity: '1' },
  			},
  		},
  		boxShadow: {
  			'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
  			'medium': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
  			'glow': '0 0 20px rgba(124, 58, 237, 0.3)',
  			'glow-lg': '0 0 32px rgba(124, 58, 237, 0.4)',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
