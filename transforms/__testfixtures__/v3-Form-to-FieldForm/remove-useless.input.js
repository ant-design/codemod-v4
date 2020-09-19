import { Form, Icon as LegacyIcon } from '@ant-design/compatible';

class AntForm extends React.Component {
  render() {
    return (
      <Form>
        <Form.Item>
          {getFieldDecorator('field1', {
            rules: [{ required: true }],
            initialValue: 'antd'
          })(<input style={{ width: 100 }} />)}
        </Form.Item>
      </Form>
    );
  }
}

export default Form.create({})(AntForm);
