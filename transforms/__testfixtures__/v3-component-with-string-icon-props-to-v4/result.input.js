// hello
import { Result, Button } from 'antd';

ReactDOM.render(
  <Result
    icon="question"
    title="Great, we have done all the operations!"
    extra={<Button type="primary">Next</Button>}
  />,
  mountNode,
);
