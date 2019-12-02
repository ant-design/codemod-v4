# Ant Design Codemod

> Still under development

A collection of codemod scripts that help upgrade antd v4 using [jscodeshift](https://github.com/facebook/jscodeshift).(Inspired by [react-codemod](https://github.com/reactjs/react-codemod))

[![NPM version](https://img.shields.io/npm/v/@ant-design/codemod.svg?style=flat)](https://npmjs.org/package/@ant-design/codemod)
[![NPM downloads](http://img.shields.io/npm/dm/@ant-design/codemod.svg?style=flat)](https://npmjs.org/package/@ant-design/codemod)
[![CircleCI](https://circleci.com/gh/ant-design/codemod.svg?style=svg)](https://circleci.com/gh/ant-design/codemod)

## Usage

```shell
# global installation
npm i -g @ant-design/codemod

# for tsx
antd-codemod run --dir=src --parser=babylon
# for js
antd-codemod run --dir=src/**/*.tsx --parser=tsx

# or using npx
# for tsx
npx -p @ant-design/codemod antd-codemod run --dir=src --parser=tsx
npx -p @ant-design/codemod antd-codemod run --dir=src/**/*.tsx

# for js
npx -p @ant-design/codemod antd-codemod run --dir=src
npx -p @ant-design/codemod antd-codemod run --dir=src/**/*.js
```

**tips**

If you are using typescript, you can use `--parser=tsx` option.
