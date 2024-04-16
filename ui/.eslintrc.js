module.exports = {
    root: true,
    extends: ['@allenai/eslint-config-varnish', 'prettier'],
    rules: {
        'eol-last': ['error', 'always'],
        'react/react-in-jsx-scope': 'off',
        'react-native/no-inline-styles': 'off',
        'prettier/prettier': 0,
    },
};