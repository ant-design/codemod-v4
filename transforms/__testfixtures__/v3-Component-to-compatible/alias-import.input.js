import { Form as AntdForm, Mention as AntdMention, Input, Button } from 'antd';

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

const { toString, toContentState } = AntdMention;

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
