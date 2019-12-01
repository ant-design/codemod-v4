# Ant Design Codemod

A collection of codemod scripts that help upgrade antd v4 using [jscodeshift](https://github.com/facebook/jscodeshift).(Inspired by [react-codemod](https://github.com/reactjs/react-codemod))

## Usage

```shell
# for tsx
npx -p @ant-design/codemod antd-codemod run --path src --parser tsx
npx -p @ant-design/codemod antd-codemod run --path src/**/*.tsx

# for js
npx -p @ant-design/codemod antd-codemod run --path src
npx -p @ant-design/codemod antd-codemod run --path src/**/*.js
```

**tips**

If you are using typescript, you can use `--parser tsx` option.
