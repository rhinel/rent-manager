// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:vue/recommended',
  ],
  // required to lint *.vue files
  plugins: ['html'],
  // check if imports actually resolve
  settings: {
    'import/resolver': {
      'webpack': {
        'config': 'build/webpack.base.conf.js'
      }
    },
    'html/html-extensions': ['.html']
  },
  // add your custom rules here
  rules: {
    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      'js': 'never',
      'vue': 'never'
    }],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': ['test/unit/index.js']
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // 允许使用console
    'no-console': 0,
    // 末尾不要求分号
    'semi': [2, 'never'],
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // 要求使用拖尾逗号
    'comma-dangle': ['error', 'always-multiline'],
    // 可以进行参数赋值
    'no-param-reassign': ['error', { 'props': false }],
    // 不校验换行符
    'linebreak-style': 0,
    // 采用vue indent
    'indent': 0,
    // closeBracket: 1
    'vue/html-indent': ['error', 2, {
      'attribute': 1,
      'closeBracket': 1,
      'alignAttributesVertically': true,
      'ignores': []
    }],
    // vue indent
    'vue/script-indent': ['error', 2, {
      'baseIndent': 1
    }],
    // vue order
    'vue/attributes-order': [2, { order: [
      'OTHER_ATTR',
      'LIST_RENDERING',
      'CONDITIONALS',
      'RENDER_MODIFIERS',
      'GLOBAL',
      'UNIQUE',
      'BINDING',
      'EVENTS',
      'CONTENT',
      'DEFINITION'
    ] }],
    // 花括号的换行
    'object-curly-newline': ['error', { 'consistent': true }],
    // 数组不要求结构赋值
    'prefer-destructuring': ['error', { 'object': true, 'array': false }],
    // 可用变量前下划线
    'no-underscore-dangle': 0,
  }
}
