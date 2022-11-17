import { UserFilled, UserOutlined } from '@ant-design/icons';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Avatar, Badge } from 'antd';

ReactDOM.render(
  <div>
    <span style={{ marginRight: 24 }}>
      <Badge count={1}>
        <Avatar shape="square" icon={<UserOutlined />} />
      </Badge>
    </span>
    <span>
      <Badge dot>
        <Avatar shape="square" icon={<UserOutlined />} />
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
    (<Badge count={1}>
      <Avatar shape="square" icon={<LegacyIcon type={props.icon} />} />
    </Badge>)
  );
}
