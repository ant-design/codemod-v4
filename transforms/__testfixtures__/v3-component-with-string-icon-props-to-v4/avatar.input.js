import { UserFilled } from '@ant-design/icons';
import { Avatar, Badge } from 'antd';

ReactDOM.render(
  <div>
    <span style={{ marginRight: 24 }}>
      <Badge count={1}>
        <Avatar shape="square" icon="user" />
      </Badge>
    </span>
    <span>
      <Badge dot>
        <Avatar shape="square" icon="user" />
      </Badge>
    </span>
    <span>
      <Badge dot>
        <Avatar shape="square" icon={<UserFilled />} />
      </Badge>
    </span>
  </div>,
  mountNode,
);

const CustomAvatar = (props) => {
  return (
    <Badge count={1}>
      <Avatar shape="square" icon={props.icon} />
    </Badge>
  );
}
