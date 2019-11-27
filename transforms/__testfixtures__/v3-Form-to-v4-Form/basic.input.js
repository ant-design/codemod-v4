import { Form, Input, Button } from 'antd';

class MyForm extends React.Component {
  render() {
    return (
      <Form>
        {getFieldDecorator('username')(<Input />)}
        <Button>Submit</Button>
      </Form>
    );
  }
}

export default Form.create()(MyForm);
