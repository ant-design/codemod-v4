import { Form } from 'antd';
import { FormItem } from 'components';

const input = <input />;

ReactDOM.render(
  <div>
    <FormItem>
      {getFieldDecorator('field1', {
        rules: [{ required: true }]
      })(<input style={{ width: 100 }} />)}
    </FormItem>
    <FormItem>
      {getFieldDecorator('field2', {
        rules: [{ required: true }]
      })(input)}
    </FormItem>
  </div>,
  mountNode
);
