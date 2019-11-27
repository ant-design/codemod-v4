import { Form as AntdForm, Input, Button } from 'antd';

class MyForm extends React.Component {
  render() {
    return (
      <AntdForm>
        {getFieldDecorator('username')(<Input />)}
        <Button>Submit</Button>
      </AntdForm>
    );
  }
}

export default Form.create()(MyForm);
