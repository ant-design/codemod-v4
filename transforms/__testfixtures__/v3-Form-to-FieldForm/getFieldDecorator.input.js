import { Form } from 'antd';

const input = <input />;

ReactDOM.render(
  <div>
    <div>
      {getFieldDecorator('field1', {
        rules: [{ required: true }]
      })(<input style={{ width: 100 }} />)}
    </div>
    <div>
      {getFieldDecorator('field2', {
        rules: [{ required: true }]
      })(input)}
    </div>
  </div>,
  mountNode
);
