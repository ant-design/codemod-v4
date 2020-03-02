import { Form } from 'antd';

const input = <input />;

ReactDOM.render(
  <div>
    <Form.Item name='field1' rules={[{ required: true }]}>
      <input style={{ width: 100 }} />
    </Form.Item>
    <Form.Item name='field2' rules={[{ required: true }]}>
      {input}
    </Form.Item>
  </div>,
  mountNode
);
