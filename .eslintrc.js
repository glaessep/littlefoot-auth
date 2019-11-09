module.exports = {
  root: true,
  // extends: '@react-native-community',
  extends: ['airbnb', 'prettier'],
  rules: {
    'no-unused-vars': ['error', { args: 'none' }],
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }]
  }
};
