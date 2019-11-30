import { Form, Input, Button, Mention } from 'antd';

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

const { toString, toContentState } = Mention;

function onChange(contentState) {
  console.log(toString(contentState));
}

function onSelect(suggestion) {
  console.log('onSelect', suggestion);
}

ReactDOM.render(
  <div>
    <MyForm />
    <Mention
      style={{ width: '100%' }}
      onChange={onChange}
      defaultValue={toContentState('@afc163')}
      defaultSuggestions={['afc163', 'benjycui', 'yiminghe', 'RaoHai', '中文', 'にほんご']}
      onSelect={onSelect}
    />
  </div>,
  mountNode,
);
