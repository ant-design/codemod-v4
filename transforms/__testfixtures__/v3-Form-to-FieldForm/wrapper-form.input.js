import { Form } from 'antd';

const input = <input />;

const outerForm = (
  <Form.Item>
    {getFieldDecorator('outerform', {
      initialValue: 'outer'
    })(<input />)}
  </Form.Item>
);

ReactDOM.render(
  <Form>
    <Form.Item>
      {getFieldDecorator('field1', {
        rules: [{ required: true }],
        initialValue: 'antd'
      })(<input style={{ width: 100 }} />)}
    </Form.Item>
    <Form.Item>
      {getFieldDecorator(field2, {
        rules: [{ required: true }],
        initialValue: 'antd-1'
      })(input)}
    </Form.Item>
    {outerForm}
  </Form>,
  mountNode
);
