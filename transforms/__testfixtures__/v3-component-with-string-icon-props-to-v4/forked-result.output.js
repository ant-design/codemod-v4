/* blablabla */
import { QuestionOutlined } from '@ant-design/icons';

import { Result, Button } from '@forked/antd';

ReactDOM.render(
  <Result
    icon={<QuestionOutlined />}
    title="Great, we have done all the operations!"
    extra={<Button type="primary">Next</Button>}
  />,
  mountNode,
);
