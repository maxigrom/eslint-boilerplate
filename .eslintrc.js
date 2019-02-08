module.exports = {
  env: {
    'browser': true,
    'es6': true,
    'jest': true,
  },
  extends: ['eslint-config-airbnb'],
  rules: {
    'max-len': ['error', {
      code: 120,
      'ignoreComments': true,
      'ignoreTrailingComments': true,
      'ignoreUrls': true,
      'ignoreStrings': true,
      'ignoreTemplateLiterals': true,
      'ignoreRegExpLiterals': true
    }],
    'no-unused-vars': ['error', {
      'args': 'after-used',
      'ignoreRestSiblings': true
    }],
    'no-prototype-builtins': 0,

    'import/prefer-default-export': 0,

    'jsx-a11y/label-has-for': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/anchor-is-valid': 0,

    'react/prefer-stateless-function': 0,
    'react/jsx-filename-extension': 0,
    'react/forbid-prop-types': 0,
    'react/destructuring-assignment': 'never',
    'react/sort-comp': [1, {
      order: ['type-annotations', 'static-methods', 'lifecycle', 'everything-else', 'render'],
    }],
  },
  settings: {
    'import/resolver': {
      'node': {
        'moduleDirectory': [
          'node_modules',
          'src'
        ]
      }
    }
  },
};
