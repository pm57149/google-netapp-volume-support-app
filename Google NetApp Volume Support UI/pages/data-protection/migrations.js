import { Card, Table, Button, Space, Tag, Row, Col, Statistic, Progress } from 'antd';
import { 
  SwapOutlined, 
  CloudSyncOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import AppLayout from '../../components/Layout';

export default function Migrations() {
  const migrationData = [
    {
      key: '1',
      jobName: 'prod-volume-migration-001',
      sourceLocation: 'On-premises DataCenter',
      targetLocation: 'australia-southeast1-a',
      dataSize: '2.5 TB',
      progress: 75,
      status: 'In Progress',
      startTime: '2024-08-05 14:30:00',
      estimatedCompletion: '2024-08-06 18:45:00',
      type: 'Volume Migration',
    },
    {
      key: '2',
      jobName: 'dev-data-sync-002',
      sourceLocation: 'australia-southeast2-b',
      targetLocation: 'australia-southeast1-b',
      dataSize: '800 GB',
      progress: 100,
      status: 'Completed',
      startTime: '2024-08-04 09:15:00',
      estimatedCompletion: '2024-08-04 15:30:00',
      type: 'Data Sync',
    },
    {
      key: '3',
      jobName: 'backup-restore-migration-003',
      sourceLocation: 'Backup Vault',
      targetLocation: 'australia-southeast1-c',
      dataSize: '1.2 TB',
      progress: 0,
      status: 'Scheduled',
      startTime: '2024-08-07 02:00:00',
      estimatedCompletion: '2024-08-07 14:00:00',
      type: 'Backup Restore',
    },
    {
      key: '4',
      jobName: 'legacy-system-migration-004',
      sourceLocation: 'Legacy Storage Array',
      targetLocation: 'australia-southeast1-a',
      dataSize: '5.8 TB',
      progress: 45,
      status: 'Failed',
      startTime: '2024-08-03 20:00:00',
      estimatedCompletion: '2024-08-05 08:00:00',
      type: 'System Migration',
    },
  ];

  const columns = [
    {
      title: 'Migration Job',
      dataIndex: 'jobName',
      key: 'jobName',
      render: (text) => <Button type="link">{text}</Button>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const color = {
          'Volume Migration': 'blue',
          'Data Sync': 'green',
          'Backup Restore': 'orange',
          'System Migration': 'purple'
        }[type] || 'default';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Source → Target',
      key: 'locations',
      render: (record) => (
        <div>
          <div style={{ fontSize: '12px', color: '#5f6368' }}>From:</div>
          <div style={{ marginBottom: 4 }}>{record.sourceLocation}</div>
          <div style={{ fontSize: '12px', color: '#5f6368' }}>To:</div>
          <div>{record.targetLocation}</div>
        </div>
      ),
    },
    {
      title: 'Data Size',
      dataIndex: 'dataSize',
      key: 'dataSize',
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (record) => (
        <div>
          <Progress
            percent={record.progress}
            size="small"
            status={
              record.status === 'Failed' ? 'exception' :
              record.status === 'Completed' ? 'success' :
              'active'
            }
          />
          <div style={{ fontSize: '12px', color: '#5f6368', marginTop: 2 }}>
            {record.progress}%
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          'In Progress': { color: 'processing', icon: <CloudSyncOutlined spin /> },
          'Completed': { color: 'success', icon: <CheckCircleOutlined /> },
          'Scheduled': { color: 'default', icon: <ClockCircleOutlined /> },
          'Failed': { color: 'error', icon: <ExclamationCircleOutlined /> },
        }[status] || { color: 'default', icon: null };
        
        return (
          <Tag color={config.color} icon={config.icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: 'Est. Completion',
      dataIndex: 'estimatedCompletion',
      key: 'estimatedCompletion',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          {record.status === 'In Progress' && <Button size="small" danger>Cancel</Button>}
          {record.status === 'Failed' && <Button size="small">Retry</Button>}
          {record.status === 'Scheduled' && <Button size="small">Edit</Button>}
          <Button size="small">Details</Button>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#3c4043' }}>
            <SwapOutlined style={{ marginRight: 8, color: '#4285f4' }} />
            Migrations
          </h1>
          <Button type="primary" icon={<PlusOutlined />}>
            Start Migration
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Migrations"
              value={47}
              prefix={<SwapOutlined style={{ color: '#4285f4' }} />}
              valueStyle={{ color: '#3c4043' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={38}
              prefix={<CheckCircleOutlined style={{ color: '#34a853' }} />}
              valueStyle={{ color: '#34a853' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={3}
              prefix={<CloudSyncOutlined style={{ color: '#fbbc04' }} />}
              valueStyle={{ color: '#fbbc04' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Failed/Scheduled"
              value={6}
              prefix={<ClockCircleOutlined style={{ color: '#ea4335' }} />}
              valueStyle={{ color: '#ea4335' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Migration Success Rate */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Migration Success Rate">
            <Progress
              percent={81}
              status="active"
              strokeColor={{
                '0%': '#34a853',
                '75%': '#fbbc04',
                '90%': '#ea4335',
              }}
              format={() => '81% Success Rate'}
            />
            <div style={{ marginTop: 8, fontSize: '14px', color: '#5f6368' }}>
              38 successful out of 47 total migration jobs
            </div>
          </Card>
        </Col>
      </Row>

      {/* Migrations Table */}
      <Card title="Migration Jobs">
        <Table
          columns={columns}
          dataSource={migrationData}
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
