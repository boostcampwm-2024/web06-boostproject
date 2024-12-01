module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'ecosystem.config.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    'import/prefer-default-export': 'off', // nest not use default export
    'class-methods-use-this': 'off', // nest not use this in class
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    'no-await-in-loop': 'off',

    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'Avoid `for...in` loops.',
      },
    ],
  },
};
