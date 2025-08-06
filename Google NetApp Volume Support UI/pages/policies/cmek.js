import { Card, Table, Button, Space, Tag, Row, Col, Statistic, Descriptions } from 'antd';
import { 
  KeyOutlined, 
  LockOutlined, 
  CloudOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EditOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import AppLayout from '../../components/Layout';

export default function CMEKPolicies() {
  const cmekData = [
    {
      key: '1',
      policyName: 'Production CMEK Policy',
      keyName: 'projects/netapp-prod/locations/global/keyRings/production/cryptoKeys/netapp-storage-key',
      keyRing: 'production',
      rotation: 'Auto (90 days)',
      status: 'Active',
      appliedVolumes: 45,
      createdAt: '2024-01-15',
      lastRotated: '2024-05-15',
      region: 'australia-southeast1',
    },
    {
      key: '2',
      policyName: 'Development CMEK Policy',
      keyName: 'projects/netapp-dev/locations/global/keyRings/development/cryptoKeys/dev-storage-key',
      keyRing: 'development',
      rotation: 'Manual',
      status: 'Active',
      appliedVolumes: 12,
      createdAt: '2024-02-20',
      lastRotated: '2024-07-01',
      region: 'australia-southeast2',
    },
    {
      key: '3',
      policyName: 'Archive CMEK Policy',
      keyName: 'projects/netapp-archive/locations/global/keyRings/archive/cryptoKeys/archive-key',
      keyRing: 'archive',
      rotation: 'Auto (365 days)',
      status: 'Active',
      appliedVolumes: 8,
      createdAt: '2023-12-01',
      lastRotated: '2023-12-01',
      region: 'australia-southeast1',
    },
    {
      key: '4',
      policyName: 'Testing CMEK Policy',
      keyName: 'projects/netapp-test/locations/global/keyRings/testing/cryptoKeys/test-key',
      keyRing: 'testing',
      rotation: 'Manual',
      status: 'Inactive',
      appliedVolumes: 0,
      createdAt: '2024-07-10',
      lastRotated: 'Never',
      region: 'australia-southeast1',
    },
  ];

  const columns = [
    {
      title: 'Policy Name',
      dataIndex: 'policyName',
      key: 'policyName',
      render: (text) => (
        <div>
          <KeyOutlined style={{ marginRight: 8, color: '#4285f4' }} />
          <Button type="link">{text}</Button>
        </div>
      ),
    },
    {
      title: 'Key Ring',
      dataIndex: 'keyRing',
      key: 'keyRing',
      render: (keyRing) => <Tag color="purple">{keyRing}</Tag>,
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      render: (region) => <Tag color="blue">{region}</Tag>,
    },
    {
      title: 'Rotation',
      dataIndex: 'rotation',
      key: 'rotation',
      render: (rotation) => (
        <Tag color={rotation.includes('Auto') ? 'green' : 'orange'}>
          {rotation}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'Active' ? 'success' : 'error'}
          icon={status === 'Active' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Applied Volumes',
      dataIndex: 'appliedVolumes',
      key: 'appliedVolumes',
      render: (count) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 500 }}>{count}</div>
          <div style={{ fontSize: '12px', color: '#5f6368' }}>volumes</div>
        </div>
      ),
    },
    {
      title: 'Last Rotated',
      dataIndex: 'lastRotated',
      key: 'lastRotated',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>Edit</Button>
          <Button size="small">Rotate Key</Button>
          {record.status === 'Inactive' && (
            <Button size="small" type="primary">Activate</Button>
          )}
        </Space>
      ),
    },
  ];

  const activePolicies = cmekData.filter(policy => policy.status === 'Active').length;
  const totalVolumes = cmekData.reduce((sum, policy) => sum + policy.appliedVolumes, 0);
  const autoRotationPolicies = cmekData.filter(policy => policy.rotation.includes('Auto')).length;

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#3c4043' }}>
            <KeyOutlined style={{ marginRight: 8, color: '#4285f4' }} />
            CMEK Policies
          </h1>
          <Button type="primary" icon={<PlusOutlined />}>
            Create CMEK Policy
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
              suffix={`/ ${cmekData.length}`}
              prefix={<KeyOutlined style={{ color: '#4285f4' }} />}
              valueStyle={{ color: '#3c4043' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Protected Volumes"
              value={totalVolumes}
              prefix={<LockOutlined style={{ color: '#34a853' }} />}
              valueStyle={{ color: '#34a853' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Auto Rotation"
              value={autoRotationPolicies}
              suffix="policies"
              prefix={<SecurityScanOutlined style={{ color: '#fbbc04' }} />}
              valueStyle={{ color: '#fbbc04' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Key Rings"
              value={3}
              prefix={<CloudOutlined style={{ color: '#ea4335' }} />}
              valueStyle={{ color: '#ea4335' }}
            />
          </Card>
        </Col>
      </Row>

      {/* CMEK Information */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Customer-Managed Encryption Keys (CMEK) Overview">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Encryption Standard">AES-256</Descriptions.Item>
              <Descriptions.Item label="Key Management">Google Cloud KMS</Descriptions.Item>
              <Descriptions.Item label="Default Rotation">90 days (configurable)</Descriptions.Item>
              <Descriptions.Item label="Key Versions">Automatic versioning</Descriptions.Item>
              <Descriptions.Item label="Access Control">IAM-based permissions</Descriptions.Item>
              <Descriptions.Item label="Audit Logging">Cloud Audit Logs enabled</Descriptions.Item>
              <Descriptions.Item label="Regional Support">Multi-region support</Descriptions.Item>
              <Descriptions.Item label="Compliance">FIPS 140-2 Level 3</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Key Rotation Status */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card title="Rotation Status" size="small">
            <div style={{ textAlign: 'center' }}>
              <SecurityScanOutlined style={{ fontSize: '32px', color: '#34a853', marginBottom: 8 }} />
              <div style={{ fontSize: '16px', fontWeight: 500 }}>All Keys Current</div>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>No rotation required</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Compliance Status" size="small">
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: '#4285f4', marginBottom: 8 }} />
              <div style={{ fontSize: '16px', fontWeight: 500 }}>Compliant</div>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>All policies meet requirements</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Security Level" size="small">
            <div style={{ textAlign: 'center' }}>
              <LockOutlined style={{ fontSize: '32px', color: '#ea4335', marginBottom: 8 }} />
              <div style={{ fontSize: '16px', fontWeight: 500 }}>High Security</div>
              <div style={{ fontSize: '12px', color: '#5f6368' }}>FIPS 140-2 Level 3</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* CMEK Policies Table */}
      <Card title="CMEK Policies">
        <Table
          columns={columns}
          dataSource={cmekData}
          expandable={{
            expandedRowRender: record => (
              <div style={{ margin: 0, padding: '12px 0' }}>
                <strong>Key Name:</strong>
                <p style={{ margin: '8px 0', fontFamily: 'monospace', fontSize: '12px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                  {record.keyName}
                </p>
                <Row gutter={16}>
                  <Col span={8}>
                    <strong>Created:</strong>
                    <div>{record.createdAt}</div>
                  </Col>
                  <Col span={8}>
                    <strong>Region:</strong>
                    <div>{record.region}</div>
                  </Col>
                  <Col span={8}>
                    <strong>Volumes Protected:</strong>
                    <div>{record.appliedVolumes} volumes</div>
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
