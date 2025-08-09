import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Row, Col, Statistic, Table, Tag, Button, Spin, Alert, Descriptions, Progress, Tabs, message, Space } from 'antd';
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
  ThunderboltOutlined,
  BulbOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import AppLayout from '../../components/Layout';

const { TabPane } = Tabs;

export default function PoolDetails() {
  const router = useRouter();
  const { poolId } = router.query;
  const [poolData, setPoolData] = useState(null);
  const [volumes, setVolumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [volumesLoading, setVolumesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [volumesError, setVolumesError] = useState(null);
  
  // New state for tabs and insights
  const [activeTab, setActiveTab] = useState('details');
  const [insightsData, setInsightsData] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);
  const [pollStatus, setPollStatus] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);
  const [insightsRequestId, setInsightsRequestId] = useState(null);
  const [insightsRequestInitiated, setInsightsRequestInitiated] = useState(false);

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

  // Fetch pool insights by polling for results
  const fetchPoolInsights = async (poolId, poolVolumes) => {
    if (!insightsRequestId) {
      // If no request ID, try to initiate the request first
      await initiateInsightsRequest(poolId);
      if (!insightsRequestId) {
        setInsightsError('No insights request found. Please try refreshing the page.');
        return;
      }
    }
    
    try {
      setInsightsLoading(true);
      setInsightsError(null);
      setPollStatus('processing');
      
      console.log('Polling for insights results with ID:', insightsRequestId);
      
      // Start polling for results immediately
      startPolling(insightsRequestId);
      
    } catch (error) {
      console.error('Error fetching pool insights:', error);
      setInsightsError(error.message);
      setPollStatus('failed');
      setInsightsLoading(false);
    }
  };

  // Start polling for insight results
  const startPolling = (taskId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/poll-response/${taskId}`);
        const data = await response.json();
        
        console.log('Poll response:', data);
        
        // Handle the new response format
        if (data.data?.status === 'completed' && data.data?.response) {
          // Process the completed response with the new format
          setInsightsData({
            response: data.data.response,
            status: 'completed',
            timestamp: new Date().toISOString(),
            volumes: ["vol1", "vol2", "vol3"],
            result: data.data.result || { volumesAnalyzed: 3 }
          });
          setPollStatus('completed');
          clearInterval(interval);
          setPollInterval(null);
          setInsightsLoading(false);
        } else if (data.data?.status === 'processing') {
          // Still processing
          setPollStatus('processing');
        } else if (data.status === 'failed' || data.data?.status === 'failed') {
          setInsightsError('Analysis failed. Please try again.');
          setPollStatus('failed');
          clearInterval(interval);
          setPollInterval(null);
          setInsightsLoading(false);
        } else {
          // Handle other status or continue polling
          setPollStatus(data.data?.status || data.status || 'processing');
        }
      } catch (error) {
        console.error('Polling error:', error);
        setInsightsError('Failed to get analysis results');
        setPollStatus('failed');
        clearInterval(interval);
        setPollInterval(null);
        setInsightsLoading(false);
      }
    }, 3000); // Poll every 3 seconds
    
    setPollInterval(interval);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'insights' && !insightsData && !insightsLoading) {
      // When switching to insights tab, start polling if we have a request ID
      if (insightsRequestId) {
        fetchPoolInsights(poolId, volumes);
      } else if (!insightsRequestInitiated) {
        // If no request initiated yet, start it
        initiateInsightsRequest(poolId);
      }
    }
  };

  // Initiate insights request when pool is loaded
  const initiateInsightsRequest = async (poolId) => {
    if (insightsRequestInitiated) return; // Prevent duplicate requests
    
    try {
      console.log('Initiating insights request for pool:', poolId);
      setInsightsRequestInitiated(true);
      
      // For now, use fixed volume names for testing
      const volumeNames = ["vol1", "vol2", "vol3"];
      
      // Call insights API to start the analysis
      const response = await fetch('/api/find-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ volNames: volumeNames }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Store the request ID for later polling
      if (result.taskId) {
        setInsightsRequestId(result.taskId);
        console.log('Insights request initiated with ID:', result.taskId);
      } else {
        console.log('No task ID received, insights may be completed immediately');
        // Handle immediate response if no polling is needed
        if (result.insights) {
          setInsightsData({
            response: "Analysis completed successfully.",
            status: 'completed',
            timestamp: new Date().toISOString(),
            volumes: volumeNames,
            result: { volumesAnalyzed: 3, isFallback: true }
          });
        }
      }
      
    } catch (error) {
      console.error('Error initiating insights request:', error);
      // Don't show error to user yet, they haven't clicked insights tab
    }
  };

  // Initial data loading effect
  useEffect(() => {
    if (poolId) {
      fetchPoolDetails(poolId);
      fetchVolumes(poolId);
      // Initiate insights request when pool is first loaded
      initiateInsightsRequest(poolId);
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
            Pool: {poolData?.resourceId || poolId}
          </h1>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              fetchPoolDetails(poolId);
              fetchVolumes(poolId);
              // Reset insights state and initiate new request
              setInsightsRequestInitiated(false);
              setInsightsRequestId(null);
              setInsightsData(null);
              setInsightsError(null);
              setPollStatus(null);
              initiateInsightsRequest(poolId);
              if (activeTab === 'insights') {
                // Will be handled by the new request
              }
            }}
            loading={loading || volumesLoading || insightsLoading}
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

      {/* Tabs for Pool Details and Insights */}
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        size="large"
        style={{ marginBottom: 24 }}
      >
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              Pool Details
            </span>
          } 
          key="details"
        >

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
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <BulbOutlined />
              Pool Insights
            </span>
          } 
          key="insights"
        >
          {insightsLoading || pollStatus === 'processing' ? (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <Spin size="large" />
              <p style={{ marginTop: '16px', fontSize: '16px', color: '#666' }}>
                {pollStatus === 'processing' ? 'Analyzing volumes...' : 'Starting analysis...'}
              </p>
              <p style={{ fontSize: '14px', color: '#999' }}>
                Analyzing volumes: vol1, vol2, vol3
              </p>
              {pollStatus === 'processing' && (
                <Tag color="blue" style={{ marginTop: '8px' }}>
                  Status: {pollStatus}
                </Tag>
              )}
            </div>
          ) : insightsError ? (
            <Alert
              message="Error Loading Insights"
              description={insightsError}
              type="error"
              showIcon
              action={
                <Button 
                  size="small" 
                  onClick={() => fetchPoolInsights(poolId, volumes)}
                >
                  Retry
                </Button>
              }
            />
          ) : insightsData?.response ? (
            <>
              {/* Analysis Results */}
              <Card 
                title={
                  <Space>
                    <BulbOutlined style={{ color: '#52c41a' }} />
                    Volume Analysis Results
                    <Tag color="green">Completed</Tag>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <div style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line',
                  color: '#3c4043'
                }}>
                  {insightsData.response}
                </div>
              </Card>

              {/* Analysis Summary */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Volumes Analyzed"
                      value={insightsData.volumes?.length || 3}
                      prefix={<DatabaseOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Analysis Status"
                      value="Complete"
                      valueStyle={{ color: '#52c41a' }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Generated"
                      value={new Date(insightsData.timestamp).toLocaleTimeString()}
                      prefix={<ClusterOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Key Findings */}
              <Card title="Key Findings" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Alert
                      message="Volume Activity Status"
                      description="No activity detected on vol1, vol2, and vol3 during monitoring period"
                      type="info"
                      showIcon
                      style={{ marginBottom: 8 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Alert
                      message="Data Protection"
                      description="Only vol3 has data protection policy enabled"
                      type="warning"
                      showIcon
                      style={{ marginBottom: 8 }}
                    />
                  </Col>
                </Row>
              </Card>

              {/* Actions */}
              <Card title="Recommended Actions">
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Verify volume connectivity and accessibility</li>
                  <li>Enable data protection policies for vol1 and vol2</li>
                  <li>Review volumes for potential cleanup if unused</li>
                  <li>Monitor for expected activity patterns</li>
                </ul>
              </Card>

              {/* Data Source Info */}
              <Card size="small" style={{ marginTop: 16 }}>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <p>Analysis completed: {new Date(insightsData.timestamp).toLocaleString()}</p>
                  <p>Volumes analyzed: {insightsData.volumes?.join(', ') || 'vol1, vol2, vol3'}</p>
                </div>
              </Card>
            </>
          ) : (
            // Initial state - automatically start analysis
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <Spin size="large" />
              <p style={{ marginTop: '16px', fontSize: '16px', color: '#666' }}>
                Initializing volume analysis...
              </p>
            </div>
          )}
        </TabPane>
      </Tabs>
    </AppLayout>
  );
}
