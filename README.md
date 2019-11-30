# Ant Design Codemod

A collection of codemod scripts that help upgrade antd v4 using [jscodeshift](https://github.com/facebook/jscodeshift).(Inspired by [react-codemod](https://github.com/reactjs/react-codemod))

## Usage samples

```shell
git clone git@github.com:ant-design/codemod.git antd-codemod
npx jscodeshift -t antd-codemod/transforms/v3-Icon-to-v4-Icon.js src/**/*.js --parser=babylon
npx jscodeshift -t antd-codemod/transforms/v3-Component-to-compatible.js src/**/*.js --parser=babylon # for Form and Mention
npx jscodeshift -t antd-codemod/transforms/v3-LocaleProvider-to-v4-ConfigProvider.js src/**/*.js --parser=babylon
npx jscodeshift -t antd-codemod/transforms/v4-Icon-Outlined.js src/**/*.js --parser=babylon

node bin/antd-codemod.js run --path=es/*.js
```

**tips**

If you are using typescript, you can use `--parser=tsx` option.
