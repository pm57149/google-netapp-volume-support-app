import { Row, Col, Card, Statistic, Table, Progress, List, Avatar, Tag, Typography, Button, Space } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  UserOutlined, 
  ShoppingCartOutlined,
  DollarOutlined,
  EyeOutlined
} from '@ant-design/icons';
import AppLayout from '../components/Layout';

const { Title, Text } = Typography;

export default function Home() {
  // Sample data for the dashboard
  const statsData = [
    {
      title: 'Total Users',
      value: 11280,
      precision: 0,
      valueStyle: { color: '#3f8600' },
      prefix: <ArrowUpOutlined />,
      suffix: '',
    },
    {
      title: 'Revenue',
      value: 93215,
      precision: 2,
      valueStyle: { color: '#3f8600' },
      prefix: <DollarOutlined />,
      suffix: '',
    },
    {
      title: 'Orders',
      value: 1320,
      precision: 0,
      valueStyle: { color: '#cf1322' },
      prefix: <ArrowDownOutlined />,
      suffix: '',
    },
    {
      title: 'Page Views',
      value: 52410,
      precision: 0,
      valueStyle: { color: '#3f8600' },
      prefix: <EyeOutlined />,
      suffix: '',
    },
  ];

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      render: (tags) => (
        <>
          {tags.map((tag) => {
            let color = tag.length > 5 ? 'geekblue' : 'green';
            if (tag === 'loser') {
              color = 'volcano';
            }
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="middle">
          <a>Invite</a>
          <a>Delete</a>
        </Space>
      ),
    },
  ];

  const tableData = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
      tags: ['nice', 'developer'],
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
      tags: ['loser'],
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sydney No. 1 Lake Park',
      tags: ['cool', 'teacher'],
    },
  ];

  const listData = [
    {
      title: 'New user registered',
      description: 'John Doe just created an account',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
      time: '2 minutes ago'
    },
    {
      title: 'Order completed',
      description: 'Order #12345 has been completed successfully',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2',
      time: '5 minutes ago'
    },
    {
      title: 'System maintenance',
      description: 'Scheduled maintenance completed',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=3',
      time: '1 hour ago'
    },
  ];

  return (
    <AppLayout>
      <div>
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">Welcome back! Here's what's happening with your application.</Text>
        
        <Row gutter={16} style={{ marginTop: 24 }}>
          {statsData.map((stat, index) => (
            <Col span={6} key={index}>
              <Card>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  precision={stat.precision}
                  valueStyle={stat.valueStyle}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={16}>
            <Card title="Recent Users" extra={<Button type="primary">View All</Button>}>
              <Table columns={tableColumns} dataSource={tableData} pagination={false} />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Recent Activity">
              <List
                itemLayout="horizontal"
                dataSource={listData}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={item.avatar} />}
                      title={item.title}
                      description={item.description}
                    />
                    <div>{item.time}</div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card title="Performance Metrics">
              <div style={{ marginBottom: 16 }}>
                <Text>CPU Usage</Text>
                <Progress percent={75} status="active" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Text>Memory Usage</Text>
                <Progress percent={60} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Text>Disk Usage</Text>
                <Progress percent={45} />
              </div>
              <div>
                <Text>Network</Text>
                <Progress percent={90} status="exception" />
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Quick Actions">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" block icon={<UserOutlined />}>
                  Add New User
                </Button>
                <Button block icon={<ShoppingCartOutlined />}>
                  Create Order
                </Button>
                <Button block icon={<DollarOutlined />}>
                  Generate Report
                </Button>
                <Button block icon={<EyeOutlined />}>
                  View Analytics
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
} 