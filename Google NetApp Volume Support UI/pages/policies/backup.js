import { Card, Table, Button, Space, Tag, Row, Col, Statistic, Progress } from 'antd';
import { 
  SaveOutlined, 
  CalendarOutlined, 
  DatabaseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EditOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import AppLayout from '../../components/Layout';

export default function BackupPolicies() {
  const backupPolicyData = [
    {
      key: '1',
      policyName: 'Production Daily Backup',
      schedule: 'Daily at 2:00 AM',
      retention: '30 days',
      volumes: ['volume-001', 'volume-002', 'volume-003'],
      lastBackup: '2024-08-06 02:00:00',
      nextBackup: '2024-08-07 02:00:00',
      status: 'Active',
      successRate: 98,
      backupType: 'Incremental',
      compression: 'Enabled',
      encryption: 'AES-256',
    },
    {
      key: '2',
      policyName: 'Weekly Full Backup',
      schedule: 'Weekly on Sunday at 11:00 PM',
      retention: '90 days',
      volumes: ['volume-001', 'volume-004', 'volume-005'],
      lastBackup: '2024-08-04 23:00:00',
      nextBackup: '2024-08-11 23:00:00',
      status: 'Active',
      successRate: 95,
      backupType: 'Full',
      compression: 'Enabled',
      encryption: 'AES-256',
    },
    {
      key: '3',
      policyName: 'Monthly Archive Backup',
      schedule: 'Monthly on 1st at 12:00 AM',
      retention: '365 days',
      volumes: ['volume-001', 'volume-002', 'volume-003', 'volume-004', 'volume-005'],
      lastBackup: '2024-08-01 00:00:00',
      nextBackup: '2024-09-01 00:00:00',
      status: 'Active',
      successRate: 100,
      backupType: 'Full',
      compression: 'Enabled',
      encryption: 'AES-256',
    },
    {
      key: '4',
      policyName: 'Development Backup',
      schedule: 'Daily at 6:00 PM',
      retention: '7 days',
      volumes: ['dev-volume-001', 'dev-volume-002'],
      lastBackup: '2024-08-05 18:00:00',
      nextBackup: '2024-08-06 18:00:00',
      status: 'Paused',
      successRate: 92,
      backupType: 'Incremental',
      compression: 'Disabled',
      encryption: 'AES-128',
    },
    {
      key: '5',
      policyName: 'Critical System Backup',
      schedule: 'Every 4 hours',
      retention: '14 days',
      volumes: ['critical-volume-001'],
      lastBackup: '2024-08-06 08:00:00',
      nextBackup: '2024-08-06 12:00:00',
      status: 'Active',
      successRate: 99,
      backupType: 'Incremental',
      compression: 'Enabled',
      encryption: 'AES-256',
    },
  ];

  const columns = [
    {
      title: 'Policy Name',
      dataIndex: 'policyName',
      key: 'policyName',
      render: (text) => (
        <div>
          <SaveOutlined style={{ marginRight: 8, color: '#4285f4' }} />
          <Button type="link">{text}</Button>
        </div>
      ),
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule) => (
        <div>
          <CalendarOutlined style={{ marginRight: 4, color: '#5f6368' }} />
          {schedule}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'backupType',
      key: 'backupType',
      render: (type) => (
        <Tag color={type === 'Full' ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Retention',
      dataIndex: 'retention',
      key: 'retention',
    },
    {
      title: 'Volumes',
      dataIndex: 'volumes',
      key: 'volumes',
      render: (volumes) => (
        <div>
          <DatabaseOutlined style={{ marginRight: 4 }} />
          {volumes.length} volumes
        </div>
      ),
    },
    {
      title: 'Success Rate',
      key: 'successRate',
      render: (record) => (
        <div>
          <Progress
            percent={record.successRate}
            size="small"
            status={record.successRate >= 95 ? 'success' : record.successRate >= 90 ? 'active' : 'exception'}
          />
          <div style={{ fontSize: '12px', textAlign: 'center' }}>{record.successRate}%</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          'Active': { color: 'success', icon: <CheckCircleOutlined /> },
          'Paused': { color: 'warning', icon: <ClockCircleOutlined /> },
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
      title: 'Next Backup',
      dataIndex: 'nextBackup',
      key: 'nextBackup',
      render: (time) => (
        <div style={{ fontSize: '12px' }}>
          {new Date(time).toLocaleString()}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>Edit</Button>
          {record.status === 'Paused' ? (
            <Button size="small" type="primary">Resume</Button>
          ) : (
            <Button size="small">Pause</Button>
          )}
          <Button size="small">Run Now</Button>
        </Space>
      ),
    },
  ];

  const activePolicies = backupPolicyData.filter(policy => policy.status === 'Active').length;
  const pausedPolicies = backupPolicyData.filter(policy => policy.status === 'Paused').length;
  const totalVolumes = [...new Set(backupPolicyData.flatMap(policy => policy.volumes))].length;
  const avgSuccessRate = Math.round(backupPolicyData.reduce((sum, policy) => sum + policy.successRate, 0) / backupPolicyData.length);

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#3c4043' }}>
            <SaveOutlined style={{ marginRight: 8, color: '#4285f4' }} />
            Backup Policies
          </h1>
          <Button type="primary" icon={<PlusOutlined />}>
            Create Backup Policy
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Policies"
              value={activePolicies}
              suffix={`/ ${backupPolicyData.length}`}
              prefix={<SaveOutlined style={{ color: '#4285f4' }} />}
              valueStyle={{ color: '#3c4043' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Protected Volumes"
              value={totalVolumes}
              prefix={<DatabaseOutlined style={{ color: '#34a853' }} />}
              valueStyle={{ color: '#34a853' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Success Rate"
              value={avgSuccessRate}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#fbbc04' }} />}
              valueStyle={{ color: '#fbbc04' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Paused Policies"
              value={pausedPolicies}
              prefix={<ClockCircleOutlined style={{ color: '#ea4335' }} />}
              valueStyle={{ color: '#ea4335' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Backup Schedule Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card title="Backup Frequency" size="small">
            <div style={{ textAlign: 'center' }}>
              <ScheduleOutlined style={{ fontSize: '32px', color: '#4285f4', marginBottom: 8 }} />
              <div style={{ fontSize: '16px', fontWeight: 500 }}>5 Active Schedules</div>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>From 4-hour to monthly intervals</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Encryption Status" size="small">
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: '#34a853', marginBottom: 8 }} />
              <div style={{ fontSize: '16px', fontWeight: 500 }}>All Encrypted</div>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>AES-256 & AES-128</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Compression" size="small">
            <div style={{ textAlign: 'center' }}>
              <SaveOutlined style={{ fontSize: '32px', color: '#fbbc04', marginBottom: 8 }} />
              <div style={{ fontSize: '16px', fontWeight: 500 }}>80% Enabled</div>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>Reduces storage costs</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Overall Success Rate */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Overall Backup Success Rate">
            <Progress
              percent={avgSuccessRate}
              status="active"
              strokeColor={{
                '0%': '#34a853',
                '85%': '#fbbc04',
                '95%': '#ea4335',
              }}
              format={() => `${avgSuccessRate}% Average Success Rate`}
            />
            <div style={{ marginTop: 8, fontSize: '14px', color: '#5f6368' }}>
              Based on success rates across all backup policies
            </div>
          </Card>
        </Col>
      </Row>

      {/* Backup Policies Table */}
      <Card title="Backup Policies">
        <Table
          columns={columns}
          dataSource={backupPolicyData}
          expandable={{
            expandedRowRender: record => (
              <div style={{ margin: 0, padding: '12px 0' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <strong>Protected Volumes:</strong>
                    <div style={{ marginTop: 8 }}>
                      {record.volumes.map((volume, index) => (
                        <Tag key={index} style={{ margin: '2px' }}>{volume}</Tag>
                      ))}
                    </div>
                  </Col>
                  <Col span={8}>
                    <strong>Last Backup:</strong>
                    <div>{record.lastBackup}</div>
                    <br />
                    <strong>Encryption:</strong>
                    <div>{record.encryption}</div>
                  </Col>
                  <Col span={8}>
                    <strong>Backup Type:</strong>
                    <div>{record.backupType}</div>
                    <br />
                    <strong>Compression:</strong>
                    <div>{record.compression}</div>
                  </Col>
                </Row>
              </div>
            ),
            rowExpandable: record => true,
          }}
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
