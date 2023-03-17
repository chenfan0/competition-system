module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  overrides: [],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
  },
  plugins: ['vue', '@typescript-eslint', 'import'],
  rules: {
    'import/order': 'error',
    'vue/multi-word-component-names': 0,
    'no-undef': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/ban-types': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-explicit-any': 0,
  },
}
