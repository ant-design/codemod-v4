import { Form } from 'antd';

const input = <input />;

const outerForm = (
  <Form.Item name='outerform'>
    <input />
  </Form.Item>
);

ReactDOM.render(
  <Form
    initialValue={{
      outerform: 'outer',
      field1: 'antd',
      [field2]: 'antd-1'
    }}>
    <Form.Item name='field1' rules={[{ required: true }]}>
      <input style={{ width: 100 }} />
    </Form.Item>
    <Form.Item name={field2} rules={[{ required: true }]}>
      {input}
    </Form.Item>
    {outerForm}
  </Form>,
  mountNode
);
