import { Card, Table, Button, Space, Tag, Row, Col, Statistic, Descriptions } from 'antd';
import { 
  WindowsOutlined, 
  UserOutlined, 
  TeamOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons';
import AppLayout from '../../components/Layout';

export default function ActiveDirectory() {
  const adData = [
    {
      key: '1',
      domainName: 'corporate.netapp.local',
      dnsServers: ['10.1.1.10', '10.1.1.11'],
      organizationalUnit: 'OU=NetAppStorage,DC=corporate,DC=netapp,DC=local',
      status: 'Connected',
      userCount: 1250,
      groupCount: 85,
      lastSync: '2024-08-06 09:30:00',
      encryption: 'AES-256',
    },
    {
      key: '2',
      domainName: 'dev.netapp.local',
      dnsServers: ['10.2.1.10', '10.2.1.11'],
      organizationalUnit: 'OU=Development,DC=dev,DC=netapp,DC=local',
      status: 'Connected',
      userCount: 340,
      groupCount: 25,
      lastSync: '2024-08-06 09:45:00',
      encryption: 'AES-256',
    },
    {
      key: '3',
      domainName: 'test.netapp.local',
      dnsServers: ['10.3.1.10'],
      organizationalUnit: 'OU=TestEnvironment,DC=test,DC=netapp,DC=local',
      status: 'Disconnected',
      userCount: 75,
      groupCount: 8,
      lastSync: '2024-08-05 14:20:00',
      encryption: 'AES-128',
    },
  ];

  const columns = [
    {
      title: 'Domain Name',
      dataIndex: 'domainName',
      key: 'domainName',
      render: (text) => (
        <div>
          <WindowsOutlined style={{ marginRight: 8, color: '#4285f4' }} />
          <Button type="link">{text}</Button>
        </div>
      ),
    },
    {
      title: 'DNS Servers',
      dataIndex: 'dnsServers',
      key: 'dnsServers',
      render: (servers) => (
        <div>
          {servers.map((server, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: 2 }}>
              {server}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Users/Groups',
      key: 'usersGroups',
      render: (record) => (
        <div>
          <div>
            <UserOutlined style={{ marginRight: 4 }} />
            {record.userCount} users
          </div>
          <div>
            <TeamOutlined style={{ marginRight: 4 }} />
            {record.groupCount} groups
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'Connected' ? 'success' : 'error'}
          icon={status === 'Connected' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Last Sync',
      dataIndex: 'lastSync',
      key: 'lastSync',
    },
    {
      title: 'Encryption',
      dataIndex: 'encryption',
      key: 'encryption',
      render: (encryption) => (
        <Tag color="gold" icon={<LockOutlined />}>
          {encryption}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          <Button size="small" icon={<SettingOutlined />}>Configure</Button>
          {record.status === 'Disconnected' && (
            <Button size="small" type="primary">Connect</Button>
          )}
          <Button size="small">Test</Button>
        </Space>
      ),
    },
  ];

  const connectedDomains = adData.filter(domain => domain.status === 'Connected').length;
  const totalUsers = adData.reduce((sum, domain) => sum + domain.userCount, 0);
  const totalGroups = adData.reduce((sum, domain) => sum + domain.groupCount, 0);

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#3c4043' }}>
            <WindowsOutlined style={{ marginRight: 8, color: '#4285f4' }} />
            Active Directory
          </h1>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Domain
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Connected Domains"
              value={connectedDomains}
              suffix={`/ ${adData.length}`}
              prefix={<WindowsOutlined style={{ color: '#4285f4' }} />}
              valueStyle={{ color: '#3c4043' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={totalUsers}
              prefix={<UserOutlined style={{ color: '#34a853' }} />}
              valueStyle={{ color: '#34a853' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Groups"
              value={totalGroups}
              prefix={<TeamOutlined style={{ color: '#fbbc04' }} />}
              valueStyle={{ color: '#fbbc04' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Security Level"
              value="AES-256"
              prefix={<LockOutlined style={{ color: '#ea4335' }} />}
              valueStyle={{ color: '#ea4335' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Configuration Information */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Active Directory Configuration">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Authentication Protocol">Kerberos v5</Descriptions.Item>
              <Descriptions.Item label="LDAP Version">LDAP v3</Descriptions.Item>
              <Descriptions.Item label="Encryption Standard">AES-256 / AES-128</Descriptions.Item>
              <Descriptions.Item label="Password Policy">Enforced</Descriptions.Item>
              <Descriptions.Item label="Account Lockout">Enabled (5 attempts)</Descriptions.Item>
              <Descriptions.Item label="Session Timeout">8 hours</Descriptions.Item>
              <Descriptions.Item label="Sync Interval">Every 15 minutes</Descriptions.Item>
              <Descriptions.Item label="Backup Authentication">Enabled</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Domains Table */}
      <Card title="Active Directory Domains">
        <Table
          columns={columns}
          dataSource={adData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    </AppLayout>
  );
}
