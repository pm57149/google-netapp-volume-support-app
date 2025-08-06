import { Card, Table, Button, Space, Tag, Progress, Row, Col, Statistic } from 'antd';
import { 
  DatabaseOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SyncOutlined
} from '@ant-design/icons';
import AppLayout from '../../components/Layout';

export default function Backups() {
  const backupData = [
    {
      key: '1',
      name: 'volume-001-backup-daily',
      sourceVolume: 'volume-001',
      type: 'Scheduled',
      status: 'Completed',
      size: '245 GB',
      createdAt: '2024-08-06 02:00:00',
      retentionDays: 30,
    },
    {
      key: '2',
      name: 'volume-002-backup-weekly',
      sourceVolume: 'volume-002',
      type: 'Manual',
      status: 'In Progress',
      size: '1.2 TB',
      createdAt: '2024-08-06 08:15:00',
      retentionDays: 90,
    },
    {
      key: '3',
      name: 'volume-003-backup-monthly',
      sourceVolume: 'volume-003',
      type: 'Scheduled',
      status: 'Failed',
      size: '500 GB',
      createdAt: '2024-08-05 23:45:00',
      retentionDays: 365,
    },
  ];

  const columns = [
    {
      title: 'Backup Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Button type="link">{text}</Button>,
    },
    {
      title: 'Source Volume',
      dataIndex: 'sourceVolume',
      key: 'sourceVolume',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'Scheduled' ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={
            status === 'Completed' ? 'success' : 
            status === 'In Progress' ? 'processing' : 
            'error'
          }
          icon={
            status === 'Completed' ? <CheckCircleOutlined /> :
            status === 'In Progress' ? <SyncOutlined spin /> :
            <ExclamationCircleOutlined />
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Retention (Days)',
      dataIndex: 'retentionDays',
      key: 'retentionDays',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small">Restore</Button>
          <Button size="small" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#3c4043' }}>
            <DatabaseOutlined style={{ marginRight: 8, color: '#4285f4' }} />
            Backups
          </h1>
          <Button type="primary" icon={<PlusOutlined />}>
            Create Backup
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Backups"
              value={156}
              prefix={<DatabaseOutlined style={{ color: '#4285f4' }} />}
              valueStyle={{ color: '#3c4043' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Successful"
              value={142}
              prefix={<CheckCircleOutlined style={{ color: '#34a853' }} />}
              valueStyle={{ color: '#34a853' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={8}
              prefix={<SyncOutlined style={{ color: '#fbbc04' }} />}
              valueStyle={{ color: '#fbbc04' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Failed"
              value={6}
              prefix={<ExclamationCircleOutlined style={{ color: '#ea4335' }} />}
              valueStyle={{ color: '#ea4335' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Backup Success Rate */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Backup Success Rate (Last 30 Days)">
            <Progress
              percent={91}
              status="active"
              strokeColor={{
                '0%': '#34a853',
                '75%': '#fbbc04',
                '90%': '#ea4335',
              }}
              format={() => '91% Success Rate'}
            />
            <div style={{ marginTop: 8, fontSize: '14px', color: '#5f6368' }}>
              142 successful out of 156 total backup operations
            </div>
          </Card>
        </Col>
      </Row>

      {/* Backups Table */}
      <Card title="Recent Backups">
        <Table
          columns={columns}
          dataSource={backupData}
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
