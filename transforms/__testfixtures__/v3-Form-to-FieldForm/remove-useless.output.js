import { Form } from 'antd';
import { Icon as LegacyIcon } from '@ant-design/compatible';

class AntForm extends React.Component {
  render() {
    return (
      <Form
        initialValue={{
          field1: 'antd'
        }}>
        <Form.Item name='field1' rules={[{ required: true }]}>
          <input style={{ width: 100 }} />
        </Form.Item>
      </Form>
    );
  }
}

export default AntForm;
