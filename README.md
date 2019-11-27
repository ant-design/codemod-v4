# Ant Design Codemod

A collection of codemod scripts that help upgrade antd v4 using [jscodeshift](https://github.com/facebook/jscodeshift).(Inspired by [react-codemod](https://github.com/reactjs/react-codemod))

## Usage samples

```shell
npx jscodeshift -t transforms/v3-Icon-to-v4-Icon.js src/**/*.js
npx jscodeshift -t transforms/v3-Icon-to-v4-Form.js src/**/*.js
```
