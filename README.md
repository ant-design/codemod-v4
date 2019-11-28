# Ant Design Codemod

A collection of codemod scripts that help upgrade antd v4 using [jscodeshift](https://github.com/facebook/jscodeshift).(Inspired by [react-codemod](https://github.com/reactjs/react-codemod))

## Usage samples

```shell
git clone git@github.com:ant-design/codemod.git antd-codemod
npx jscodeshift -t antd-codemod/transforms/v3-Icon-to-v4-Icon.js src/**/*.js --parser=babylon
npx jscodeshift -t antd-codemod/transforms/v3-Icon-to-v4-Form.js src/**/*.js --parser=babylon
npx jscodeshift -t antd-codemod/transforms/v3-LocaleProvider-to-v4-ConfigProvider.js src/**/*.js --parser=babylon
```
