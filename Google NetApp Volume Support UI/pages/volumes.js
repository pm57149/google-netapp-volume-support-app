import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Table, Tag, Button, Spin, Alert, Row, Col, Statistic, Input, Space, message, Modal } from 'antd';
import { 
  DatabaseOutlined, 
  HddOutlined, 
  CloudServerOutlined, 
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  SecurityScanOutlined,
  KeyOutlined,
  ThunderboltOutlined,
  BulbOutlined
} from '@ant-design/icons';
import AppLayout from '../components/Layout';
import { findInsights, processInsightsData, getAllRecommendations } from '../utils/insights';

const { Search } = Input;

export default function Volumes() {
  const router = useRouter();
  const { poolId } = router.query;
  const [volumes, setVolumes] = useState([]);
  const [filteredVolumes, setFilteredVolumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsData, setInsightsData] = useState(null);
  const [insightsModalVisible, setInsightsModalVisible] = useState(false);

  // Fetch all volumes and filter by pool if needed
  const fetchVolumes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all volumes (no poolId filter in API call)
      const response = await fetch('/api/volumes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const volumesData = await response.json();
      console.log('Volumes API response:', volumesData);
      
      let allVolumes = volumesData.volumes || [];
      
      // Filter by poolId if provided
      if (poolId) {
        allVolumes = allVolumes.filter(volume => 
          volume.poolId === poolId || 
          volume.pool === poolId ||
          volume.capacityPoolId === poolId ||
          volume.resourceId?.includes(poolId) ||
          volume.name?.includes(poolId)
        );
      }
      
      setVolumes(allVolumes);
      setFilteredVolumes(allVolumes);
      
      if (volumesData.error) {
        setError(`API Warning: ${volumesData.error} (using mock data)`);
      }
    } catch (err) {
      console.error('Error fetching volumes:', err);
      setError(err.message);
      setVolumes([]);
      setFilteredVolumes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolumes();
  }, [poolId]);

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredVolumes(volumes);
    } else {
      const filtered = volumes.filter(volume =>
        volume.name?.toLowerCase().includes(value.toLowerCase()) ||
        volume.displayName?.toLowerCase().includes(value.toLowerCase()) ||
        volume.resourceId?.toLowerCase().includes(value.toLowerCase()) ||
        volume.description?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredVolumes(filtered);
    }
  };

  // Handle insights generation
  const handleGetInsights = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one volume to generate insights');
      return;
    }

    try {
      setInsightsLoading(true);
      
      // Get volume names from selected keys
      const selectedVolumes = filteredVolumes.filter(vol => 
        selectedRowKeys.includes(vol.resourceId)
      );
      const volumeNames = selectedVolumes.map(vol => vol.name || vol.resourceId);
      
      console.log('Getting insights for volumes:', volumeNames);
      
      const insights = await findInsights(volumeNames);
      const processedInsights = processInsightsData(insights);
      
      setInsightsData(processedInsights);
      setInsightsModalVisible(true);
      
      message.success(`Generated insights for ${volumeNames.length} volume(s)`);
      
    } catch (error) {
      console.error('Error getting insights:', error);
      message.error(`Failed to get insights: ${error.message}`);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: false,
      name: record.resourceId,
    }),
  };

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
      title: 'Pool ID',
      dataIndex: 'poolId',
      key: 'poolId',
      render: (poolId) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => router.push(`/pool/${poolId}`)}
        >
          {poolId}
        </Button>
      ),
    },
    {
      title: 'Capacity (GiB)',
      dataIndex: 'capacityGib',
      key: 'capacityGib',
      render: (capacity) => capacity?.toLocaleString() || 'N/A',
      sorter: (a, b) => (a.capacityGib || 0) - (b.capacityGib || 0),
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
      filters: [
        { text: 'Ready', value: 'READY' },
        { text: 'Creating', value: 'CREATING' },
        { text: 'Error', value: 'ERROR' },
      ],
      onFilter: (value, record) => record.state === value,
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
      filters: [
        { text: 'Hardware', value: 'HARDWARE' },
        { text: 'Software', value: 'SOFTWARE' },
      ],
      onFilter: (value, record) => (record.storageClass || 'SOFTWARE') === value,
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
      filters: [
        { text: 'Enabled', value: true },
        { text: 'Disabled', value: false },
      ],
      onFilter: (value, record) => record.backupEnabled === value,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A',
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    },
  ];

  // Calculate statistics
  const totalCapacity = filteredVolumes.reduce((sum, volume) => sum + (volume.capacityGib || 0), 0);
  const readyVolumes = filteredVolumes.filter(volume => volume.state === 'READY').length;
  const backupEnabledVolumes = filteredVolumes.filter(volume => volume.backupEnabled).length;
  const hardwareVolumes = filteredVolumes.filter(volume => volume.storageClass === 'HARDWARE').length;

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Spin size="large" tip="Loading volumes..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#3c4043' }}>
            <DatabaseOutlined style={{ marginRight: 8, color: '#4285f4' }} />
            Volumes {poolId && <span style={{ fontSize: '16px', color: '#5f6368' }}>for Pool: {poolId}</span>}
          </h1>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchVolumes}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
        
        {error && (
          <Alert
            message="API Warning"
            description={error}
            type="warning"
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Volumes"
              value={filteredVolumes.length}
              prefix={<DatabaseOutlined style={{ color: '#4285f4' }} />}
              valueStyle={{ color: '#3c4043' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Capacity"
              value={totalCapacity}
              suffix="GiB"
              prefix={<HddOutlined style={{ color: '#34a853' }} />}
              valueStyle={{ color: '#34a853' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ready Volumes"
              value={readyVolumes}
              suffix={`/ ${filteredVolumes.length}`}
              prefix={<CloudServerOutlined style={{ color: '#34a853' }} />}
              valueStyle={{ color: '#34a853' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Backup Enabled"
              value={backupEnabledVolumes}
              suffix={`/ ${filteredVolumes.length}`}
              prefix={<SecurityScanOutlined style={{ color: '#fbbc04' }} />}
              valueStyle={{ color: '#fbbc04' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="Search volumes by name, ID, or description"
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Tag color="default">
            <FilterOutlined /> {filteredVolumes.length} of {volumes.length} volumes
          </Tag>
        </Space>
      </Card>

      {/* Volumes Table */}
      <Card 
        title="Volume Details"
        extra={
          <Space>
            <Button 
              type="primary"
              icon={<BulbOutlined />}
              loading={insightsLoading}
              disabled={selectedRowKeys.length === 0}
              onClick={handleGetInsights}
            >
              Get Insights ({selectedRowKeys.length} selected)
            </Button>
          </Space>
        }
      >
        <Table
          columns={volumeColumns}
          dataSource={filteredVolumes}
          rowKey="resourceId"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} volumes`,
          }}
          locale={{
            emptyText: filteredVolumes.length === 0 && volumes.length > 0 ? 
              'No volumes match your search criteria' : 
              poolId ? `No volumes found for pool: ${poolId}` : 'No volumes found'
          }}
          scroll={{ x: 1200 }}
          rowSelection={rowSelection}
        />
      </Card>

      {/* Insights Modal */}
      <Modal
        title={
          <Space>
            <BulbOutlined style={{ color: '#1890ff' }} />
            Volume Insights
          </Space>
        }
        visible={insightsModalVisible}
        onCancel={() => setInsightsModalVisible(false)}
        footer={null}
        width={900}
      >
        {insightsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <Spin size="large" tip="Analyzing volumes and generating insights..." />
          </div>
        ) : (
          <div>
            {insightsData?.summary ? (
              <>
                {/* Summary Statistics */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Volumes Analyzed"
                        value={insightsData.summary.totalVolumes}
                        prefix={<DatabaseOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="High Risk"
                        value={insightsData.summary.riskDistribution.high}
                        valueStyle={{ color: '#ff4d4f' }}
                        prefix={<SecurityScanOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Avg Performance"
                        value={Math.round(insightsData.summary.averagePerformanceScore)}
                        suffix="/100"
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<ThunderboltOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Recommendations"
                        value={insightsData.summary.totalRecommendations}
                        prefix={<BulbOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Risk Distribution */}
                <Card title="Risk Assessment" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Tag color="red" style={{ width: '100%', textAlign: 'center', padding: '8px' }}>
                        High Risk: {insightsData.summary.riskDistribution.high}
                      </Tag>
                    </Col>
                    <Col span={8}>
                      <Tag color="orange" style={{ width: '100%', textAlign: 'center', padding: '8px' }}>
                        Medium Risk: {insightsData.summary.riskDistribution.medium}
                      </Tag>
                    </Col>
                    <Col span={8}>
                      <Tag color="green" style={{ width: '100%', textAlign: 'center', padding: '8px' }}>
                        Low Risk: {insightsData.summary.riskDistribution.low}
                      </Tag>
                    </Col>
                  </Row>
                </Card>

                {/* Recommendations */}
                {getAllRecommendations(insightsData.raw).length > 0 && (
                  <Card title="Recommendations" style={{ marginBottom: 16 }}>
                    {getAllRecommendations(insightsData.raw).slice(0, 5).map((rec, index) => (
                      <Alert
                        key={index}
                        message={rec.description}
                        description={`Volume: ${rec.volumeName} | Impact: ${rec.impact}`}
                        type={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'}
                        showIcon
                        style={{ marginBottom: 8 }}
                      />
                    ))}
                  </Card>
                )}

                {/* Data Source Info */}
                <Card size="small">
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <p>Source: {insightsData.summary.source}</p>
                    <p>Generated: {new Date(insightsData.summary.timestamp).toLocaleString()}</p>
                    {insightsData.summary.isFallback && (
                      <Alert
                        message="Using mock data"
                        description="The insights service is unavailable. Displaying sample data for demonstration."
                        type="warning"
                        showIcon
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </div>
                </Card>
              </>
            ) : (
              <Alert
                message="No insights available"
                description="Unable to generate insights for the selected volumes. Please try again later."
                type="warning"
                showIcon
              />
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
