import { Card, Table, Button, Space, Tag, Row, Col, Statistic } from 'antd';
import { 
  SecurityScanOutlined, 
  FileProtectOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EditOutlined
} from '@ant-design/icons';
import AppLayout from '../../components/Layout';

export default function Policies() {
  const policyData = [
    {
      key: '1',
      name: 'Production Data Access Policy',
      type: 'Access Control',
      scope: 'Global',
      status: 'Active',
      appliedTo: ['Pool-001', 'Pool-002', 'Pool-003'],
      lastModified: '2024-07-15',
      createdBy: 'admin@netapp.com',
      description: 'Restricts access to production data based on user roles and time windows',
    },
    {
      key: '2',
      name: 'Development Environment Policy',
      type: 'Resource Allocation',
      scope: 'Environment Specific',
      status: 'Active',
      appliedTo: ['Pool-004', 'Pool-005'],
      lastModified: '2024-08-01',
      createdBy: 'devops@netapp.com',
      description: 'Controls resource allocation and usage limits for development environments',
    },
    {
      key: '3',
      name: 'Compliance Audit Policy',
      type: 'Compliance',
      scope: 'Global',
      status: 'Active',
      appliedTo: ['All Pools'],
      lastModified: '2024-06-20',
      createdBy: 'compliance@netapp.com',
      description: 'Ensures all storage operations comply with regulatory requirements',
    },
    {
      key: '4',
      name: 'Emergency Access Policy',
      type: 'Emergency Access',
      scope: 'Critical Systems',
      status: 'Inactive',
      appliedTo: ['Pool-001', 'Pool-006'],
      lastModified: '2024-05-10',
      createdBy: 'security@netapp.com',
      description: 'Provides emergency access procedures during system outages',
    },
    {
      key: '5',
      name: 'Data Retention Policy',
      type: 'Data Lifecycle',
      scope: 'Global',
      status: 'Pending Review',
      appliedTo: ['All Pools'],
      lastModified: '2024-08-05',
      createdBy: 'legal@netapp.com',
      description: 'Defines data retention periods and deletion procedures',
    },
  ];

  const columns = [
    {
      title: 'Policy Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Button type="link">{text}</Button>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const color = {
          'Access Control': 'blue',
          'Resource Allocation': 'green',
          'Compliance': 'orange',
          'Emergency Access': 'red',
          'Data Lifecycle': 'purple'
        }[type] || 'default';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Scope',
      dataIndex: 'scope',
      key: 'scope',
      render: (scope) => <Tag color="geekblue">{scope}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          'Active': { color: 'success', icon: <CheckCircleOutlined /> },
          'Inactive': { color: 'error', icon: <ExclamationCircleOutlined /> },
          'Pending Review': { color: 'warning', icon: <ClockCircleOutlined /> },
        }[status] || { color: 'default', icon: null };
        
        return (
          <Tag color={config.color} icon={config.icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Applied To',
      dataIndex: 'appliedTo',
      key: 'appliedTo',
      render: (appliedTo) => (
        <div>
          {appliedTo.slice(0, 2).map((item, index) => (
            <Tag key={index} size="small">{item}</Tag>
          ))}
          {appliedTo.length > 2 && (
            <Tag size="small">+{appliedTo.length - 2} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>Edit</Button>
          <Button size="small">View</Button>
          {record.status === 'Inactive' && (
            <Button size="small" type="primary">Activate</Button>
          )}
        </Space>
      ),
    },
  ];

  const activePolicies = policyData.filter(policy => policy.status === 'Active').length;
  const pendingPolicies = policyData.filter(policy => policy.status === 'Pending Review').length;
  const inactivePolicies = policyData.filter(policy => policy.status === 'Inactive').length;

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#3c4043' }}>
            <SecurityScanOutlined style={{ marginRight: 8, color: '#4285f4' }} />
            Policies
          </h1>
          <Button type="primary" icon={<PlusOutlined />}>
            Create Policy
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Policies"
              value={policyData.length}
              prefix={<SecurityScanOutlined style={{ color: '#4285f4' }} />}
              valueStyle={{ color: '#3c4043' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Policies"
              value={activePolicies}
              prefix={<CheckCircleOutlined style={{ color: '#34a853' }} />}
              valueStyle={{ color: '#34a853' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Review"
              value={pendingPolicies}
              prefix={<ClockCircleOutlined style={{ color: '#fbbc04' }} />}
              valueStyle={{ color: '#fbbc04' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Inactive Policies"
              value={inactivePolicies}
              prefix={<ExclamationCircleOutlined style={{ color: '#ea4335' }} />}
              valueStyle={{ color: '#ea4335' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Policy Categories */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card title="Access Control" size="small">
            <div style={{ textAlign: 'center' }}>
              <FileProtectOutlined style={{ fontSize: '32px', color: '#4285f4', marginBottom: 8 }} />
              <div style={{ fontSize: '16px', fontWeight: 500 }}>1 Active Policy</div>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>Controls user and system access</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Compliance" size="small">
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: '#34a853', marginBottom: 8 }} />
              <div style={{ fontSize: '16px', fontWeight: 500 }}>1 Active Policy</div>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>Ensures regulatory compliance</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Data Lifecycle" size="small">
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: '32px', color: '#fbbc04', marginBottom: 8 }} />
              <div style={{ fontSize: '16px', fontWeight: 500 }}>1 Pending Review</div>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>Manages data retention and archival</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Policies Table */}
      <Card title="All Policies">
        <Table
          columns={columns}
          dataSource={policyData}
          expandable={{
            expandedRowRender: record => (
              <div style={{ margin: 0, padding: '12px 0' }}>
                <strong>Description:</strong>
                <p style={{ margin: '8px 0', color: '#5f6368' }}>{record.description}</p>
                <strong>Applied To:</strong>
                <div style={{ marginTop: 8 }}>
                  {record.appliedTo.map((item, index) => (
                    <Tag key={index} style={{ margin: '2px' }}>{item}</Tag>
                  ))}
                </div>
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
