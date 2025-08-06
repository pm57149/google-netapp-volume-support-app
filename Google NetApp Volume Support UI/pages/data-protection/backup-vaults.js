import { Card, Table, Button, Space, Tag, Row, Col, Statistic, Progress } from 'antd';
import { 
  SecurityScanOutlined, 
  CloudOutlined, 
  LockOutlined,
  PlusOutlined,
  HddOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import AppLayout from '../../components/Layout';

export default function BackupVaults() {
  const vaultData = [
    {
      key: '1',
      name: 'production-vault-primary',
      location: 'australia-southeast1',
      encryption: 'Google-managed',
      totalCapacity: '10 TB',
      usedCapacity: '6.8 TB',
      backupCount: 245,
      status: 'Active',
      createdAt: '2024-01-15',
    },
    {
      key: '2',
      name: 'development-vault-secondary',
      location: 'australia-southeast2',
      encryption: 'Customer-managed',
      totalCapacity: '5 TB',
      usedCapacity: '2.1 TB',
      backupCount: 89,
      status: 'Active',
      createdAt: '2024-02-20',
    },
    {
      key: '3',
      name: 'archive-vault-longterm',
      location: 'australia-southeast1',
      encryption: 'Google-managed',
      totalCapacity: '50 TB',
      usedCapacity: '35.2 TB',
      backupCount: 1205,
      status: 'Active',
      createdAt: '2023-12-01',
    },
  ];

  const columns = [
    {
      title: 'Vault Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Button type="link">{text}</Button>,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location) => <Tag color="blue">{location}</Tag>,
    },
    {
      title: 'Encryption',
      dataIndex: 'encryption',
      key: 'encryption',
      render: (encryption) => (
        <Tag 
          color={encryption === 'Customer-managed' ? 'gold' : 'green'}
          icon={<LockOutlined />}
        >
          {encryption}
        </Tag>
      ),
    },
    {
      title: 'Capacity',
      key: 'capacity',
      render: (record) => (
        <div>
          <div>{record.usedCapacity} / {record.totalCapacity}</div>
          <Progress
            percent={Math.round((parseFloat(record.usedCapacity) / parseFloat(record.totalCapacity)) * 100)}
            size="small"
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: 'Backups',
      dataIndex: 'backupCount',
      key: 'backupCount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'success' : 'warning'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small">Configure</Button>
          <Button size="small">Monitor</Button>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#3c4043' }}>
            <SecurityScanOutlined style={{ marginRight: 8, color: '#4285f4' }} />
            Backup Vaults
          </h1>
          <Button type="primary" icon={<PlusOutlined />}>
            Create Vault
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Vaults"
              value={3}
              prefix={<SecurityScanOutlined style={{ color: '#4285f4' }} />}
              valueStyle={{ color: '#3c4043' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Capacity"
              value="65 TB"
              prefix={<HddOutlined style={{ color: '#34a853' }} />}
              valueStyle={{ color: '#34a853' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Used Capacity"
              value="44.1 TB"
              prefix={<DatabaseOutlined style={{ color: '#fbbc04' }} />}
              valueStyle={{ color: '#fbbc04' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Backups"
              value={1539}
              prefix={<CloudOutlined style={{ color: '#ea4335' }} />}
              valueStyle={{ color: '#ea4335' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Overall Usage */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Overall Vault Usage">
            <Progress
              percent={68}
              status="active"
              strokeColor={{
                '0%': '#34a853',
                '75%': '#fbbc04',
                '90%': '#ea4335',
              }}
              format={() => '68% Used'}
            />
            <div style={{ marginTop: 8, fontSize: '14px', color: '#5f6368' }}>
              44.1 TB of 65 TB total vault capacity used
            </div>
          </Card>
        </Col>
      </Row>

      {/* Vaults Table */}
      <Card title="Backup Vaults">
        <Table
          columns={columns}
          dataSource={vaultData}
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
