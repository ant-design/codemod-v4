import { ClockCircleOutlined, SmileTwoTone } from '@ant-design/icons';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Result, Timeline } from 'antd';

ReactDOM.render(
  <Result
    icon={<SmileTwoTone />}
    title="Great, we have done all the operations!"
    extra={<Button type="primary">Next</Button>}
  />,
  mountNode,
);

ReactDOM.render(
  <Timeline>
    <Timeline.Item>Create a services site 2015-09-01</Timeline.Item>
    <Timeline.Item>Solve initial network problems 2015-09-01</Timeline.Item>
    <Timeline.Item dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />} color="red">
      Technical testing 2015-09-01
    </Timeline.Item>
    <Timeline.Item>Network problems being solved 2015-09-01</Timeline.Item>
  </Timeline>,
  mountNode,
);

const DynamicIcon = props => {
  <LegacyIcon type={props.type} theme={props.theme} />
}
