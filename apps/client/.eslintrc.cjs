module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		'airbnb', // or airbnb-base
		'plugin:react/recommended',
		'plugin:jsx-a11y/recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
	],
	parser: '@typescript-eslint/parser',
	rules: {
		'react/react-in-jsx-scope': 'off',
		'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
		'prettier/prettier': ['error', { endOfLine: 'auto' }],
		'no-shadow': 0,
		'import/no-unresolved': 0,
		'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
		'import/extensions': 0,
		'import/prefer-default-export': 0,
		'react/require-default-props': 0,
		'react/jsx-props-no-spreading': 0,
	},
};
