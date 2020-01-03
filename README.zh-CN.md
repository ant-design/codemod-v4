[English](./README.md) | 简体中文

# Ant Design v4 Codemod

一组帮助你升级到 antd v4 的 codemod 脚本集合，基于 [jscodeshift](https://github.com/facebook/jscodeshift) 构建。(受 [react-codemod](https://github.com/reactjs/react-codemod) 启发)

[![NPM version](https://img.shields.io/npm/v/@ant-design/codemod-v4.svg?style=flat)](https://npmjs.org/package/@ant-design/codemod-v4)
[![NPM downloads](http://img.shields.io/npm/dm/@ant-design/codemod-v4.svg?style=flat)](https://npmjs.org/package/@ant-design/codemod-v4)
[![CircleCI](https://circleci.com/gh/ant-design/codemod-v4.svg?style=svg)](https://circleci.com/gh/ant-design/codemod-v4)

## 使用

在运行 codemode 脚本前，请先提交你的本地代码修改。

```shell
# 全局安装
npm i -g @ant-design/codemod-v4
# or for yarn user
#  yarn global add @ant-design/codemod-v4
antd4-codemod src

# 使用 npx
npx -p @ant-design/codemod-v4 antd4-codemod src
```

## Codemod 脚本包括:

#### `v3-Component-to-compatible`

将已废弃的 `Form` 和 `Mention` 组件通过 `@ant-design/compatible` 包引入:

```diff
- import { Form, Input, Button, Mention } from 'antd';
+ import { Form, Mention } from '@ant-design/compatible';
+ import '@ant-design/compatible/assets/index.css';
+ import { Input, Button } from 'antd';

  ReactDOM.render( (
    <div>
      <Form>
        {getFieldDecorator('username')(<Input />)}
        <Button>Submit</Button>
      </Form>
      <Mention
        style={{ width: '100%' }}
        onChange={onChange}
        defaultValue={toContentState('@afc163')}
        defaultSuggestions={['afc163', 'benjycui']}
        onSelect={onSelect}
      />
    </div>
  );
```

#### `v3-component-with-string-icon-props-to-v4`

将那些包含字符串 icon props 的组件转换成从 `@ant-design/icons` 中特定组件引入。

```diff
  import { Avatar, Button, Result } from 'antd';
+ import { QuestionOutlined, UserOutlined } from '@ant-design/icons';

  ReactDOM.render(
    <div>
-     <Button type="primary" shape="circle" icon="search" />
+     <Button type="primary" shape="circle" icon={SearchOutlined} />
-     <Avatar shape="square" icon="user" />
+     <Avatar shape="square" icon={UserOutlined} />
      <Result
-       icon="question"
+       icon={<QuestionOutlined />}
        title="Great, we have done all the operations!"
        extra={<Button type="primary">Next</Button>}
      />
    </div>,
    mountNode,
  );

```

#### `v3-Icon-to-v4-Icon`

将 v3 Icon 组件转换成 `@ant-design/icons` 中特定组件引入。

```diff
- import { Icon, Input } from 'antd';
+ import { Input } from 'antd';
+ import Icon, { CodeFilled, SmileOutlined, SmileTwoTone } from '@ant-design/icons';

  const HeartSvg = () => (
    <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
      <path d="M923 plapla..." />
    </svg>
  );

  const HeartIcon = props => <Icon component={HeartSvg} {...props} />;

  ReactDOM.render(
    <div>
-     <Icon type="code" theme="filled" />
+     <CodeFilled />
-     <Icon type="smile" theme="twoTone" twoToneColor="#eb2f96" />
+     <SmileTwoTone twoToneColor="#eb2f96" />
-     <Icon type="code" theme={props.fill ? 'filled' : 'outlined'} />
+     <LegacyIcon type="code" theme={props.fill ? 'filled' : 'outlined'} />
      <HeartIcon />
      <Icon viewBox="0 0 24 24">
        <title>Cool Home</title>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </Icon>
      <Input suffix={<SmileOutlined />} />
    </div>,
    mountNode,
  );

```

#### `v3-LocaleProvider-to-v4-ConfigProvider`

将 v3 LocaleProvider 组件转换成 v4 ConfigProvider 组件。

```diff
- import { LocaleProvider } from 'antd';
+ import { ConfigProvider } from 'antd';

  ReactDOM.render(
-   <LocaleProvider {...yourConfig}>
+   <ConfigProvider {...yourConfig}>
      <Main />
-   </LocaleProvider>
+   </ConfigProvider>
    mountNode,
  );
```

#### `v3-Modal-method-with-icon-to-v4`

将 `Modal.method()` 包含字符串 icon 属性的调用转换成从 `@ant-design/icons` 中特定组件引入。

```diff
import { Modal } from 'antd';
+ import { AntDesignOutlined } from '@ant-design/icons';

  Modal.confirm({
-   icon: 'ant-design',
+   icon: <AntDesignOutlined />,
    title: 'Do you Want to delete these items?',
    content: 'Some descriptions',
    onOk() {
      console.log('OK');
    },
    onCancel() {
      console.log('Cancel');
    },
  });
```

## License

MIT
