import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
	darkMode: ['class'],
	content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
	theme: {
		fontFamily: {
			sans: ['Pretendard', ...fontFamily.sans],
		},
		extend: {
			colors: {
				green: 'var(--green)',

				white: 'var(--white)',
				gray: {
					100: 'var(--gray-100)',
					200: 'var(--gray-200)',
					300: 'var(--gray-300)',
					400: 'var(--gray-400)',
					500: 'var(--gray-500)',
					600: 'var(--gray-600)',
					700: 'var(--gray-700)',
					800: 'var(--gray-800)',
					900: 'var(--gray-900)',
				},
				black: 'var(--black)',

				blue: {
					400: 'var(--blue-400)',
					500: 'var(--blue-500)',
					600: 'var(--blue-600)',
					700: 'var(--blue-700)',
				},

				navy: {
					400: 'var(--navy-400)',
					500: 'var(--navy-500)',
					600: 'var(--navy-600)',
					700: 'var(--navy-700)',
					800: 'var(--navy-800)',
					900: 'var(--navy-900)',
				},
				red: {
					400: 'var(--red-400)',
				},
			},
		},
	},
	plugins: [],
};
