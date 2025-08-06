import React, { useState, useEffect } from 'react';
import { DownOutlined, InfoCircleOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import { Tree, Card, Typography, Spin, message, Modal, Descriptions, Tag, Button } from 'antd';

const { Title } = Typography;

// API function to fetch pools
const fetchPools = async () => {
  try {
    const response = await fetch('/api/pools');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching pools:', error);
    throw error;
  }
};

// Transform API data to tree structure
const transformPoolsToTreeData = (poolsData, onShowMore) => {
  console.log('🔄 Transform function called with:', poolsData);
  
  // Handle different possible API response structures
  let pools = [];
  
  if (poolsData?.pools) {
    pools = poolsData.pools;
    console.log('📊 Found pools in poolsData.pools:', pools.length, 'pools');
  } else if (poolsData?.capacityPools) {
    pools = poolsData.capacityPools;
    console.log('📊 Found pools in poolsData.capacityPools:', pools.length, 'pools');
  } else if (Array.isArray(poolsData)) {
    pools = poolsData;
    console.log('📊 Found pools as direct array:', pools.length, 'pools');
  } else if (poolsData?.items) {
    pools = poolsData.items;
    console.log('📊 Found pools in poolsData.items:', pools.length, 'pools');
  } else if (poolsData?.data) {
    pools = poolsData.data;
    console.log('📊 Found pools in poolsData.data:', pools.length, 'pools');
  } else {
    console.warn('⚠️ Unknown API response structure:', poolsData);
    console.log('🔍 Available keys:', Object.keys(poolsData || {}));
    return [];
  }

  console.log('📋 Extracted pools array:', pools);

  return pools.map((pool, index) => {
    // Extract pool name from different possible fields
    // Priority order: name -> displayName -> resourceId -> poolId -> other fallbacks
    const poolName = pool.name || 
                    pool.displayName || 
                    pool.resourceId ||
                    pool.poolId ||
                    pool.poolName || 
                    pool.capacityPoolName ||
                    pool.id?.split('/').pop() ||
                    pool.resourceName ||
                    `Pool-${index + 1}`;

    console.log(`🏊 Pool ${index + 1}:`, {
      originalPool: pool,
      extractedName: poolName,
      availableFields: Object.keys(pool || {})
    });

    return {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', width: '100%' }}>
          <span>{poolName}</span>
          <InfoCircleOutlined 
            style={{ 
              color: '#1890ff', 
              fontSize: '14px',
              cursor: 'pointer',
              padding: '4px'
            }} 
            title="Show pool details"
            onClick={(e) => {
              e.stopPropagation();
              onShowMore({...pool, name: poolName}, index);
            }}
          />
        </span>
      ),
      key: pool.name || pool.id || `pool-${index + 1}`,
      poolData: pool, // Store the full pool data for reference
      children: [
        {
          title: 'Volumes',
          key: `${poolName}-volumes`,
          children: pool.volumes?.map((volume, volIndex) => ({
            title: volume.name || volume.displayName || `volume-${volIndex + 1}`,
            key: `${poolName}-volume-${volIndex + 1}`,
          })) || [
            {
              title: 'No volumes available',
              key: `${poolName}-no-volumes`,
              disabled: true,
            },
          ],
        },
        {
          title: 'Aggregates',
          key: `${poolName}-aggregates`,
          children: pool.aggregates?.map((aggregate, aggIndex) => ({
            title: aggregate.name || aggregate.displayName || `aggr-${aggIndex + 1}`,
            key: `${poolName}-aggr-${aggIndex + 1}`,
          })) || [
            {
              title: 'No aggregates available',
              key: `${poolName}-no-aggregates`,
              disabled: true,
            },
          ],
        },
        {
          title: 'Storage VMs',
          key: `${poolName}-svms`,
          children: pool.storageVMs?.map((svm, svmIndex) => ({
            title: svm.name || svm.displayName || `svm-${svmIndex + 1}`,
            key: `${poolName}-svm-${svmIndex + 1}`,
          })) || [
            {
              title: 'No storage VMs available',
              key: `${poolName}-no-svms`,
              disabled: true,
            },
          ],
        },
      ],
    };
  });
};

// Fallback static data (original data as fallback)
const fallbackTreeData = [
  {
    title: 'Pool-01',
    key: 'pool-01',
    children: [
      {
        title: 'Volumes',
        key: 'pool-01-volumes',
        children: [
          {
            title: 'volume-01',
            key: 'pool-01-volume-01',
          },
          {
            title: 'volume-02',
            key: 'pool-01-volume-02',
          },
          {
            title: 'volume-03',
            key: 'pool-01-volume-03',
          },
        ],
      },
      {
        title: 'Aggregates',
        key: 'pool-01-aggregates',
        children: [
          {
            title: 'aggr-01',
            key: 'pool-01-aggr-01',
          },
          {
            title: 'aggr-02',
            key: 'pool-01-aggr-02',
          },
        ],
      },
      {
        title: 'Storage VMs',
        key: 'pool-01-svms',
        children: [
          {
            title: 'svm-01',
            key: 'pool-01-svm-01',
          },
          {
            title: 'svm-02',
            key: 'pool-01-svm-02',
          },
        ],
      },
    ],
  },
  {
    title: 'Pool-02',
    key: 'pool-02',
    children: [
      {
        title: 'Volumes',
        key: 'pool-02-volumes',
        children: [
          {
            title: 'volume-04',
            key: 'pool-02-volume-04',
          },
          {
            title: 'volume-05',
            key: 'pool-02-volume-05',
          },
        ],
      },
      {
        title: 'Aggregates',
        key: 'pool-02-aggregates',
        children: [
          {
            title: 'aggr-03',
            key: 'pool-02-aggr-03',
          },
        ],
      },
      {
        title: 'Storage VMs',
        key: 'pool-02-svms',
        children: [
          {
            title: 'svm-03',
            key: 'pool-02-svm-03',
          },
        ],
      },
    ],
  },
  {
    title: 'Pool-03',
    key: 'pool-03',
    children: [
      {
        title: 'Volumes',
        key: 'pool-03-volumes',
        children: [
          {
            title: 'volume-06',
            key: 'pool-03-volume-06',
          },
        ],
      },
      {
        title: 'Aggregates',
        key: 'pool-03-aggregates',
        children: [
          {
            title: 'aggr-04',
            key: 'pool-03-aggr-04',
          },
          {
            title: 'aggr-05',
            key: 'pool-03-aggr-05',
          },
        ],
      },
      {
        title: 'Storage VMs',
        key: 'pool-03-svms',
        children: [
          {
            title: 'svm-04',
            key: 'pool-03-svm-04',
          },
          {
            title: 'svm-05',
            key: 'pool-03-svm-05',
          },
        ],
      },
    ],
  },
];

const PoolsTree = () => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);

  const handleShowMore = (pool, index) => {
    setSelectedPool({ ...pool, index });
    setModalVisible(true);
  };

  const loadPools = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching pools from API...');
      
      const poolsData = await fetchPools();
      console.log('📡 API Response received:', poolsData);
      console.log('📊 API Response type:', typeof poolsData);
      console.log('📋 API Response keys:', Object.keys(poolsData || {}));
      
      const transformedData = transformPoolsToTreeData(poolsData, handleShowMore);
      console.log('🔄 Transformed data:', transformedData);
      console.log('📈 Number of pools found:', transformedData.length);
      
      if (transformedData.length > 0) {
        setTreeData(transformedData);
        message.success(`✅ Successfully loaded ${transformedData.length} pools from API`);
        console.log('✅ Tree data set with API data');
      } else {
        // API returned successfully but no pools found, use fallback
        console.log('⚠️ No pools found in API response, using fallback data');
        const fallbackPools = fallbackTreeData.map((item, index) => ({
          name: item.title,
          key: item.key,
          location: 'australia-southeast1-b',
          projectId: '81821054389',
          serviceLevel: 'Premium',
          size: '1024 GB',
          usedCapacity: `${Math.floor(Math.random() * 800) + 200} GB`,
          network: 'default-network',
          state: 'READY',
          createTime: new Date().toISOString(),
          description: `NetApp Cloud Volumes Service pool ${item.title}`
        }));
        const transformedFallbackData = transformPoolsToTreeData({ pools: fallbackPools }, handleShowMore);
        setTreeData(transformedFallbackData);
        message.info('ℹ️ No pools found in API response, showing demo data');
      }
    } catch (err) {
      console.error('❌ Failed to load pools:', err);
      setError(err.message);
      
      // Use fallback data if API fails
      console.log('🔧 API failed, using fallback data');
      const fallbackPools = fallbackTreeData.map((item, index) => ({
        name: item.title,
        key: item.key,
        location: 'australia-southeast1-b',
        projectId: '81821054389',
        serviceLevel: 'Premium',
        size: '1024 GB',
        usedCapacity: `${Math.floor(Math.random() * 800) + 200} GB`,
        network: 'default-network',
        state: 'READY',
        createTime: new Date().toISOString(),
        description: `NetApp Cloud Volumes Service pool ${item.title}`
      }));
      const transformedFallbackData = transformPoolsToTreeData({ pools: fallbackPools }, handleShowMore);
      setTreeData(transformedFallbackData);
      message.warning('⚠️ Failed to load pools from API, using fallback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, []);

  const onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
    // You can add logic here to handle different selections
    // For example, navigate to different pages or show different content
  };

  const onExpand = (expandedKeys, info) => {
    console.log('expanded', expandedKeys, info);
  };

  if (loading) {
    return (
      <div>
        <Title level={3} style={{ marginBottom: 24 }}>
          NetApp Storage Pools
        </Title>
        <Card 
          title="Pool Hierarchy" 
          style={{ 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            textAlign: 'center',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} 
            tip="Loading pools..."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        NetApp Storage Pools
        {error && (
          <span style={{ 
            fontSize: '12px', 
            color: '#ff4d4f', 
            marginLeft: '8px',
            fontWeight: 'normal'
          }}>
            (API Error: {error})
          </span>
        )}
      </Title>
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              Pool Hierarchy 
              <span style={{ 
                fontSize: '12px', 
                color: '#8c8c8c', 
                marginLeft: '8px',
                fontWeight: 'normal'
              }}>
                ({treeData.length} pool{treeData.length !== 1 ? 's' : ''} loaded)
              </span>
            </span>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              size="small"
              loading={loading}
              onClick={loadPools}
            >
              Refresh
            </Button>
          </div>
        }
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}
      >
        <Tree
          showLine
          switcherIcon={<DownOutlined />}
          defaultExpandedKeys={treeData.length > 0 ? [treeData[0]?.key] : []}
          onSelect={onSelect}
          onExpand={onExpand}
          treeData={treeData}
          style={{
            background: '#fafafa',
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid #f0f0f0'
          }}
        />
      </Card>

      {/* Pool Details Modal */}
      <Modal
        title={`Pool Details: ${selectedPool?.name || 'Unknown Pool'}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedPool && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Pool Name" span={2}>
              <Tag color="blue">{selectedPool.name || 'N/A'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {selectedPool.location || 'australia-southeast1-b'}
            </Descriptions.Item>
            <Descriptions.Item label="Project ID">
              {selectedPool.projectId || '81821054389'}
            </Descriptions.Item>
            <Descriptions.Item label="Service Level">
              <Tag color="green">{selectedPool.serviceLevel || 'Premium'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Size">
              {selectedPool.size || '1024 GB'}
            </Descriptions.Item>
            <Descriptions.Item label="Used Capacity">
              {selectedPool.usedCapacity || '512 GB'}
            </Descriptions.Item>
            <Descriptions.Item label="Network">
              {selectedPool.network || 'default-network'}
            </Descriptions.Item>
            <Descriptions.Item label="State" span={2}>
              <Tag color={selectedPool.state === 'READY' ? 'green' : 'orange'}>
                {selectedPool.state || 'READY'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Creation Time" span={2}>
              {selectedPool.createTime || new Date().toISOString()}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedPool.description || 'NetApp Cloud Volumes Service pool for storing volumes and aggregates.'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default PoolsTree;
