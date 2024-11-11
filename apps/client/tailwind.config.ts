import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
	darkMode: ['class'],
	content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
	theme: {
		fontFamily: {
			sans: ['Pretendard', ...fontFamily.sans],
		},
		extend: {
			animation: {
				'gradient-rotate': 'gradient-rotate 10s linear infinite',
			},
			keyframes: {
				'gradient-rotate': {
					'0%, 100%': {
						'background-size': '200% 200%',
						'background-position': '0% 100%',
					},
					'25%': {
						'background-size': '200% 200%',
						'background-position': '100% 100%',
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': '0% 100%',
					},
					'75%': {
						'background-size': '200% 200%',
						'background-position': '0% 0%',
					},
				},
			},
			backgroundImage: {
				'gradient-conic': 'conic-gradient(from 0deg, var(--tw-gradient-stops))',
			},
			colors: {
				green: {
					400: 'hsl(var(--green-400))',
					500: 'hsl(var(--green-500))',
					600: 'hsl(var(--green-600))',
					700: 'hsl(var(--green-700))',
				},

				white: 'hsl(var(--white))',
				gray: {
					100: 'hsl(var(--gray-100))',
					200: 'hsl(var(--gray-200))',
					300: 'hsl(var(--gray-300))',
					400: 'hsl(var(--gray-400))',
					500: 'hsl(var(--gray-500))',
					600: 'hsl(var(--gray-600))',
					700: 'hsl(var(--gray-700))',
					800: 'hsl(var(--gray-800))',
					900: 'hsl(var(--gray-900))',
				},
				black: 'hsl(var(--black))',

				blue: {
					400: 'hsl(var(--blue-400))',
					500: 'hsl(var(--blue-500))',
					600: 'hsl(var(--blue-600))',
					700: 'hsl(var(--blue-700))',
				},

				navy: {
					400: 'hsl(var(--navy-400))',
					500: 'hsl(var(--navy-500))',
					600: 'hsl(var(--navy-600))',
					700: 'hsl(var(--navy-700))',
					800: 'hsl(var(--navy-800))',
					900: 'hsl(var(--navy-900))',
				},
				red: {
					400: 'hsl(var(--red-400))',
				},

				primary: {
					DEFAULT: 'hsl(var(--green-500))',
					foreground: 'hsl(var(--white))',
				},

				secondary: {
					DEFAULT: 'hsl(var(--blue-500))',
					foreground: 'hsl(var(--white))',
				},

				destructive: {
					DEFAULT: 'hsl(var(--red-400))',
					foreground: 'hsl(var(--white))',
				},

				accent: {
					DEFAULT: 'hsl(var(--navy-400))',
					foreground: 'hsl(var(--white))',
				},
			},
		},
	},
	plugins: [],
};
