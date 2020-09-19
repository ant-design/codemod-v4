import { Form } from 'antd';
import { FormItem } from 'components';

const input = <input />;

ReactDOM.render(
  <div>
    <FormItem name='field1' rules={[{ required: true }]}>
      <input style={{ width: 100 }} />
    </FormItem>
    <FormItem name='field2' rules={[{ required: true }]}>
      {input}
    </FormItem>
  </div>,
  mountNode
);
