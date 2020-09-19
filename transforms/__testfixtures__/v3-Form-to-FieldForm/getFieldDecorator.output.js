import { Form } from 'antd';

const input = <input />;

ReactDOM.render(
  <div>
    <div>
      <Form.Item noStyle name='field1' rules={[{ required: true }]}><input style={{ width: 100 }} /></Form.Item>
    </div>
    <div>
      <Form.Item noStyle name='field2' rules={[{ required: true }]}>{input}</Form.Item>
    </div>
  </div>,
  mountNode
);
