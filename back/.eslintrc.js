const path = require('path');
  
module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-typescript/base'
  ],
  rules: {
    '@typescript-eslint/camelcase': 0,
    'no-underscore-dangle': ['error', { 'allow': ['_id'] }],
    'max-len': ['error', { 'code': 140 }],
    'import/prefer-default-export': 0,
    'object-curly-newline': ['error', {
      multiline: true,
      minProperties: 1,
    }]
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  settings: {
    'import/resolver': {
        node: {
            paths: [path.resolve(__dirname, 'src')],
        },
    },
  },
};
