import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Row, Col, Statistic, Table, Tag, Button, Spin, Alert, Descriptions, Progress } from 'antd';
import { 
  DatabaseOutlined, 
  HddOutlined, 
  CloudServerOutlined, 
  ReloadOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
  KeyOutlined,
  NetworkOutlined,
  ClusterOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import AppLayout from '../../components/Layout';

export default function PoolDetails() {
  const router = useRouter();
  const { poolId } = router.query;
  const [poolData, setPoolData] = useState(null);
  const [volumes, setVolumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [volumesLoading, setVolumesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [volumesError, setVolumesError] = useState(null);

  // Fetch volumes for the pool
  const fetchVolumes = async (poolId) => {
    try {
      setVolumesLoading(true);
      setVolumesError(null);
      
      const response = await fetch(`/api/volumes?poolId=${encodeURIComponent(poolId)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const volumesData = await response.json();
      console.log('Volumes API response:', volumesData);
      
      setVolumes(volumesData.volumes || []);
      
      if (volumesData.error) {
        setVolumesError(`API Warning: ${volumesData.error} (using mock data)`);
      }
    } catch (err) {
      console.error('Error fetching volumes:', err);
      setVolumesError(err.message);
      setVolumes([]); // Set empty array on error
    } finally {
      setVolumesLoading(false);
    }
  };

  // Fetch pool details
  const fetchPoolDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from the pools API first
      const response = await fetch('/api/pools');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const poolsData = await response.json();
      console.log('Pools API response:', poolsData);
      
      // Extract pools from different possible structures
      let pools = [];
      if (poolsData?.pools) {
        pools = poolsData.pools;
      } else if (poolsData?.capacityPools) {
        pools = poolsData.capacityPools;
      } else if (Array.isArray(poolsData)) {
        pools = poolsData;
      } else if (poolsData?.items) {
        pools = poolsData.items;
      }
      
      // Find the specific pool by resourceId or other identifiers
      const pool = pools.find(p => 
        p.resourceId === id || 
        p.name === id || 
        p.id === id ||
        p.poolId === id ||
        p.capacityPoolName === id
      );
      
      if (pool) {
        setPoolData(pool);
      } else {
        // If not found in API, create mock data based on poolId
        setPoolData(createMockPoolData(id));
      }
    } catch (err) {
      console.error('Error fetching pool details:', err);
      setError(err.message);
      // Create mock data as fallback
      setPoolData(createMockPoolData(id));
    } finally {
      setLoading(false);
    }
  };

  // Create mock pool data for demonstration
  const createMockPoolData = (id) => {
    return {
      resourceId: id,
      name: id,
      displayName: `Pool ${id}`,
      state: 'READY',
      storagePoolState: 'READY',
      storagePoolStateDetails: 'Pool is healthy and operational',
      serviceLevel: 'Premium',
      storageClass: 'hardware',
      location: 'australia-southeast1-b',
      zone: 'australia-southeast1-b',
      region: 'australia-southeast1',
      network: 'projects/project-id/global/networks/netapp-network',
      subnet: 'projects/project-id/regions/australia-southeast1/subnetworks/netapp-subnet',
      capacityGib: 1000,
      usedCapacityGib: 750,
      availableCapacityGib: 250,
      allocatedCapacityGib: 800,
      throughputMibps: 16,
      maxThroughputMibps: 128,
      iopsLimit: 10000,
      protocolTypes: ['NFSv3', 'NFSv4', 'SMB'],
      encryptionType: 'SERVICE_MANAGED',
      kmsKeyName: 'projects/project-id/locations/australia-southeast1/keyRings/netapp-ring/cryptoKeys/netapp-key',
      activeDirectory: null,
      ldapEnabled: false,
      globalAccessAllowed: false,
      psaRange: '10.0.0.0/29',
      restoreEnabled: true,
      backupPolicy: {
        enabled: true,
        dailyBackupLimit: 7,
        weeklyBackupLimit: 4,
        monthlyBackupLimit: 12
      },
      volumes: [
        {
          name: `${id}-volume-1`,
          displayName: 'Database Volume',
          capacityGib: 500,
          state: 'READY',
          protocol: 'NFSv3'
        },
        {
          name: `${id}-volume-2`, 
          displayName: 'Application Volume',
          capacityGib: 250,
          state: 'READY',
          protocol: 'NFSv4'
        }
      ],
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-08-01T14:20:00Z',
      description: `NetApp Cloud Volume for ${id}`,
      labels: {
        environment: 'production',
        team: 'infrastructure',
        project: 'netapp-demo',
        cost_center: 'cc-12345',
        owner: 'infrastructure-team'
      }
    };
  };

  useEffect(() => {
    if (poolId) {
      fetchPoolDetails(poolId);
      fetchVolumes(poolId);
    }
  }, [poolId]);

  const volumeColumns = [
    {
      title: 'Volume Name',
      dataIndex: 'resourceId',
      key: 'resourceId',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => router.push(`/volume/${record.resourceId}`)}
        >
          {record.displayName || record.name || text}
        </Button>
      ),
    },
    {
      title: 'Capacity (GiB)',
      dataIndex: 'capacityGib',
      key: 'capacityGib',
      render: (capacity) => capacity?.toLocaleString() || 'N/A',
    },
    {
      title: 'Protocols',
      dataIndex: 'protocols',
      key: 'protocols',
      render: (protocols) => (
        <div>
          {protocols?.map(protocol => (
            <Tag key={protocol} color="blue" style={{ margin: '2px' }}>
              {protocol}
            </Tag>
          )) || <Tag color="default">N/A</Tag>}
        </div>
      ),
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: (state) => (
        <Tag color={state === 'READY' ? 'green' : state === 'CREATING' ? 'orange' : 'red'}>
          {state || 'Unknown'}
        </Tag>
      ),
    },
    {
      title: 'Storage Class',
      dataIndex: 'storageClass',
      key: 'storageClass',
      render: (storageClass) => (
        <Tag color={storageClass === 'HARDWARE' ? 'purple' : 'cyan'}>
          {storageClass || 'SOFTWARE'}
        </Tag>
      ),
    },
    {
      title: 'Backup',
      dataIndex: 'backupEnabled',
      key: 'backupEnabled',
      render: (backupEnabled) => (
        <Tag color={backupEnabled ? 'green' : 'default'}>
          {backupEnabled ? 'Enabled' : 'Disabled'}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description) => description || 'No description',
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Spin size="large" tip="Loading pool details..." />
        </div>
      </AppLayout>
    );
  }

  if (error && !poolData) {
    return (
      <AppLayout>
        <Alert
          message="Error Loading Pool Details"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => fetchPoolDetails(poolId)}>
              Retry
            </Button>
          }
        />
      </AppLayout>
    );
  }

  const usagePercentage = poolData?.capacityGib ? 
    Math.round((poolData.usedCapacityGib / poolData.capacityGib) * 100) : 0;

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#3c4043' }}>
            <DatabaseOutlined style={{ marginRight: 8, color: '#4285f4' }} />
            Pool Details: {poolData?.resourceId || poolId}
          </h1>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              fetchPoolDetails(poolId);
              fetchVolumes(poolId);
            }}
            loading={loading || volumesLoading}
          >
            Refresh
          </Button>
        </div>
        
        {error && (
          <Alert
            message="API Warning"
            description={`Using mock data due to API error: ${error}`}
            type="warning"
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}
      </div>

      {/* Pool Overview Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Capacity"
              value={poolData?.capacityGib || 0}
              suffix="GiB"
              prefix={<HddOutlined style={{ color: '#4285f4' }} />}
              valueStyle={{ color: '#3c4043' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Used Capacity"
              value={poolData?.usedCapacityGib || 0}
              suffix="GiB"
              prefix={<DatabaseOutlined style={{ color: '#ea4335' }} />}
              valueStyle={{ color: '#ea4335' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Available Capacity"
              value={poolData?.availableCapacityGib || 0}
              suffix="GiB"
              prefix={<CloudServerOutlined style={{ color: '#34a853' }} />}
              valueStyle={{ color: '#34a853' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Allocated Capacity"
              value={poolData?.allocatedCapacityGib || 0}
              suffix="GiB"
              prefix={<ClusterOutlined style={{ color: '#fbbc04' }} />}
              valueStyle={{ color: '#fbbc04' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance & Limits Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Current Throughput"
              value={poolData?.throughputMibps || 0}
              suffix="MiB/s"
              prefix={<ThunderboltOutlined style={{ color: '#4285f4' }} />}
              valueStyle={{ color: '#4285f4' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Max Throughput"
              value={poolData?.maxThroughputMibps || 0}
              suffix="MiB/s"
              prefix={<ThunderboltOutlined style={{ color: '#34a853' }} />}
              valueStyle={{ color: '#34a853' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="IOPS Limit"
              value={poolData?.iopsLimit || 0}
              prefix={<SettingOutlined style={{ color: '#fbbc04' }} />}
              valueStyle={{ color: '#fbbc04' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Volumes Count"
              value={volumes?.length || 0}
              prefix={<DatabaseOutlined style={{ color: '#ea4335' }} />}
              valueStyle={{ color: '#ea4335' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Capacity Usage */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Capacity Usage">
            <Progress
              percent={usagePercentage}
              status={usagePercentage > 90 ? 'exception' : usagePercentage > 75 ? 'active' : 'success'}
              strokeColor={{
                '0%': '#34a853',
                '75%': '#fbbc04',
                '90%': '#ea4335',
              }}
              format={() => `${usagePercentage}% Used`}
            />
            <div style={{ marginTop: 8, fontSize: '14px', color: '#5f6368' }}>
              {poolData?.usedCapacityGib || 0} GiB of {poolData?.capacityGib || 0} GiB used
            </div>
          </Card>
        </Col>
      </Row>

      {/* Pool Information */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title={<><InfoCircleOutlined style={{ marginRight: 8 }} />Pool Configuration</>}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Resource ID">
                {poolData?.resourceId || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Display Name">
                {poolData?.displayName || poolData?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="State">
                <Tag color={poolData?.state === 'READY' ? 'green' : 'orange'} icon={<CheckCircleOutlined />}>
                  {poolData?.state || 'Unknown'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Storage Pool State">
                <Tag color={poolData?.storagePoolState === 'READY' ? 'green' : 'orange'}>
                  {poolData?.storagePoolState || 'Unknown'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="State Details">
                <span style={{ fontSize: '12px', color: '#5f6368' }}>
                  {poolData?.storagePoolStateDetails || 'No details available'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Service Level">
                <Tag color="blue">{poolData?.serviceLevel || 'Standard'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Storage Class">
                <Tag color="purple">{poolData?.storageClass || 'software'}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title={<><EnvironmentOutlined style={{ marginRight: 8 }} />Location & Network</>}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Region">
                {poolData?.region || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Zone">
                <Tag color="geekblue" icon={<GlobalOutlined />}>
                  {poolData?.zone || poolData?.location || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Network">
                <span style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                  {poolData?.network || 'N/A'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Subnet">
                <span style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                  {poolData?.subnet || 'N/A'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="PSA Range">
                <Tag color="cyan">{poolData?.psaRange || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Global Access">
                <Tag color={poolData?.globalAccessAllowed ? 'green' : 'red'}>
                  {poolData?.globalAccessAllowed ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title={<><SecurityScanOutlined style={{ marginRight: 8 }} />Security & Protocols</>}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Encryption Type">
                <Tag color="gold" icon={<KeyOutlined />}>
                  {poolData?.encryptionType || 'SERVICE_MANAGED'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="KMS Key">
                <span style={{ fontSize: '10px', wordBreak: 'break-all' }}>
                  {poolData?.kmsKeyName ? 
                    poolData.kmsKeyName.split('/').pop() : 
                    'Service Managed'
                  }
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Protocol Types">
                <div>
                  {poolData?.protocolTypes?.map(protocol => (
                    <Tag key={protocol} color="blue" style={{ margin: '2px' }}>
                      {protocol}
                    </Tag>
                  )) || <Tag color="blue">NFSv3</Tag>}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="LDAP Enabled">
                <Tag color={poolData?.ldapEnabled ? 'green' : 'default'}>
                  {poolData?.ldapEnabled ? 'Yes' : 'No'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Active Directory">
                <Tag color={poolData?.activeDirectory ? 'green' : 'default'}>
                  {poolData?.activeDirectory || 'Not Configured'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Backup Policy & Timestamps */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><DatabaseOutlined style={{ marginRight: 8 }} />Backup Configuration</>}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Restore Enabled">
                <Tag color={poolData?.restoreEnabled ? 'green' : 'red'}>
                  {poolData?.restoreEnabled ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Backup Policy">
                <Tag color={poolData?.backupPolicy?.enabled ? 'green' : 'orange'}>
                  {poolData?.backupPolicy?.enabled ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              {poolData?.backupPolicy?.enabled && (
                <>
                  <Descriptions.Item label="Daily Backups">
                    {poolData?.backupPolicy?.dailyBackupLimit || 0} retained
                  </Descriptions.Item>
                  <Descriptions.Item label="Weekly Backups">
                    {poolData?.backupPolicy?.weeklyBackupLimit || 0} retained
                  </Descriptions.Item>
                  <Descriptions.Item label="Monthly Backups">
                    {poolData?.backupPolicy?.monthlyBackupLimit || 0} retained
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Labels & Metadata">
            {poolData?.labels ? (
              <div style={{ marginBottom: 16 }}>
                {Object.entries(poolData.labels).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: 8 }}>
                    <Tag color="default">{key}</Tag>
                    <span style={{ marginLeft: 8 }}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#5f6368', fontStyle: 'italic', marginBottom: 16 }}>No labels available</div>
            )}
            
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Created">
                {poolData?.createdAt ? new Date(poolData.createdAt).toLocaleString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {poolData?.updatedAt ? new Date(poolData.updatedAt).toLocaleString() : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
            
            {poolData?.description && (
              <div style={{ marginTop: 16 }}>
                <strong>Description:</strong>
                <div style={{ marginTop: 4, color: '#5f6368' }}>
                  {poolData.description}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Volumes Table */}
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Volumes ({volumes?.length || 0})</span>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchVolumes(poolId)}
              loading={volumesLoading}
              size="small"
            >
              Refresh Volumes
            </Button>
          </div>
        }
      >
        {volumesError && (
          <Alert
            message="Volumes API Warning"
            description={volumesError}
            type="warning"
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}
        
        <Table
          columns={volumeColumns}
          dataSource={volumes || []}
          rowKey="resourceId"
          loading={volumesLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} volumes`,
          }}
          locale={{
            emptyText: volumesLoading ? 'Loading volumes...' : 'No volumes found in this pool'
          }}
        />
      </Card>
    </AppLayout>
  );
}
