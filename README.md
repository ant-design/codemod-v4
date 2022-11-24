English | [简体中文](./README.zh-CN.md)

# Ant Design v4 Codemod

A collection of codemod scripts that help upgrade antd v4 using [jscodeshift](https://github.com/facebook/jscodeshift).(Inspired by [react-codemod](https://github.com/reactjs/react-codemod))

[![NPM version](https://img.shields.io/npm/v/@ant-design/codemod-v4.svg?style=flat)](https://npmjs.org/package/@ant-design/codemod-v4)
[![NPM downloads](http://img.shields.io/npm/dm/@ant-design/codemod-v4.svg?style=flat)](https://npmjs.org/package/@ant-design/codemod-v4)
[![Github Action](https://github.com/ant-design/codemod-v5/actions/workflows/test.yml/badge.svg)](https://github.com/ant-design/codemod-v5/actions/workflows/test.yml)

## Usage

Before run codemod scripts, you'd better make sure to commit your local git changes firstly.

```shell
# global installation
npm i -g @ant-design/codemod-v4
# or for yarn user
#  yarn global add @ant-design/codemod-v4
antd4-codemod src

# use npx
npx -p @ant-design/codemod-v4 antd4-codemod src
```

## Codemod scripts introduction

#### `v3-Component-to-compatible`

Replace deprecated `Form` and `Mention` from `@ant-design/compatible`:

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

Update component which contains string icon props with specific v4 Icon component from `@ant-design/icons`.

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

Replace v3 Icon with specific v4 Icon component.

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

Replace v3 LocaleProvider with v4 ConfigProvider component.

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

Update `Modal.method()` which contains string icon property with specific v4 Icon component.

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
