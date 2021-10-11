/** @typedef {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'airbnb-base',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'default-case': 0, // doesn't go well with exhaustive checks

    'import/order': [
      1,
      {
        groups: ['builtin',
          'external',
          'parent',
          'sibling',
          'index'],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'parent',
            position: 'before',
          },
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    'import/prefer-default-export': 0,
    'import/extensions': 0,
    'import/no-unresolved': 0, // doesn't work with tsconfig paths
    'import/no-extraneous-dependencies': 0,

    'no-underscore-dangle': 0,
    'no-console': 2,
    'max-len': [1, 140],

    complexity: [2, 6],
    'no-param-reassign': [
      2,
      {
        props: true,
        ignorePropertyModificationsFor: ['acc'],
      },
    ],

    'array-bracket-newline': [1, 'consistent'],
    'function-call-argument-newline': [1, 'consistent'],
    'func-style': [1, 'expression'],
    'function-paren-newline': [1, 'multiline-arguments'],
    'id-denylist': [
      2,
      'data',
      'err',
      'e',
      'cb',
      'callback',
      'handleChange',
      'handleClick',
      'handleSubmit',
      'handleInput',
    ],
    'prefer-exponentiation-operator': 2,
    'padding-line-between-statements': [
      1,
      {
        blankLine: 'always',
        prev: ['const',
          'let',
          'var'],
        next: '*',
      },
      {
        blankLine: 'always',
        prev: '*',
        next: ['if',
          'try',
          'class',
          'export'],
      },
      {
        blankLine: 'always',
        prev: ['if',
          'try',
          'class',
          'export'],
        next: '*',
      },
      {
        blankLine: 'any',
        prev: ['const',
          'let',
          'var',
          'export'],
        next: ['const',
          'let',
          'var',
          'export'],
      },
      {
        blankLine: 'always',
        prev: ['expression'],
        next: ['const',
          'let',
          'var'],
      },
      {
        blankLine: 'always',
        prev: '*',
        next: ['return'],
      },
    ],

    'arrow-spacing': 1,
    'no-restricted-exports': [
      1,
      {
        restrictedNamedExports: ['default', 'then'],
      },
    ],

    '@typescript-eslint/array-type': 1,
    '@typescript-eslint/consistent-indexed-object-style': [1, 'record'],
    '@typescript-eslint/no-namespace': 0,
    '@typescript-eslint/consistent-type-assertions': [
      2,
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'never',
      },
    ],
    '@typescript-eslint/member-delimiter-style': [
      1,
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
      },
    ],
    '@typescript-eslint/member-ordering': 2,
    '@typescript-eslint/method-signature-style': [2, 'property'],
    '@typescript-eslint/naming-convention': [
      2,
      {
        selector: 'default',
        format: ['camelCase', 'PascalCase'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'forbid',
      },
      {
        selector: 'variable',
        format: ['camelCase',
          'PascalCase',
          'UPPER_CASE'],
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]', // To forbid `I-` prefix
          match: false,
        },
      },
      {
        selector: 'enumMember',
        format: ['UPPER_CASE'],
      },
    ],
    '@typescript-eslint/no-base-to-string': 1,
    '@typescript-eslint/no-confusing-non-null-assertion': 1,
    '@typescript-eslint/no-confusing-void-expression': 1,
    '@typescript-eslint/no-dynamic-delete': 1,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/no-implicit-any-catch': 2,
    '@typescript-eslint/no-invalid-void-type': 2,
    '@typescript-eslint/no-parameter-properties': [
      2,
      {
        allows: ['private readonly'],
      },
    ],
    '@typescript-eslint/no-unnecessary-condition': 1,
    '@typescript-eslint/no-unnecessary-qualifier': 1,
    '@typescript-eslint/no-unnecessary-type-constraint': 1,
    '@typescript-eslint/prefer-for-of': 1,
    '@typescript-eslint/prefer-reduce-type-parameter': 1,
    '@typescript-eslint/prefer-string-starts-ends-with': 1,
    '@typescript-eslint/promise-function-async': 1,
    '@typescript-eslint/switch-exhaustiveness-check': 2,
    '@typescript-eslint/type-annotation-spacing': 1,
    '@typescript-eslint/default-param-last': 2,

    'no-duplicate-imports': 0,
    '@typescript-eslint/no-duplicate-imports': 2,

    'no-invalid-this': 0,
    '@typescript-eslint/no-invalid-this': 2,

    'no-loss-of-precision': 0,
    '@typescript-eslint/no-loss-of-precision': 2,

    'no-return-await': 0,
    '@typescript-eslint/return-await': 2,
  },
};
