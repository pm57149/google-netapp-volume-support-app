import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { 
  Card, Row, Col, Statistic, Table, Tag, Button, Spin, Alert, 
  Descriptions, Progress, Tabs, message, Space, Input, List, Avatar
} from 'antd';
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
  BarChartOutlined,
  AppstoreOutlined,
  ExclamationCircleOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  MessageOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
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

  // New state for metrics
  const [metricsData, setMetricsData] = useState([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);
  const [metricsRequestId, setMetricsRequestId] = useState(null);
  const [metricsInterval, setMetricsInterval] = useState(null);
  const [lastMetricsUpdate, setLastMetricsUpdate] = useState(null);
  const [metricsHistory, setMetricsHistory] = useState([]);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState(null);
  const messagesEndRef = useRef(null);

  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    try {
      setIsSending(true);
      setChatError(null);
      
      // Add user message to chat
      const userMessage = { role: 'user', content: messageInput };
      setMessages(prev => [...prev, userMessage]);
      setMessageInput('');

      // Send message to MCP server
      const response = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageInput,
          context: {
            poolId,
            metrics: metricsHistory,
            // Add any other relevant context
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }

      const data = await response.json();
      
      // Add assistant's response to chat
      const assistantMessage = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatError('Failed to get response from NetApp Assistant. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
    if (!taskId) {
      console.error('No task ID provided for polling');
      return;
    }

    console.log('Starting polling with taskId:', taskId);
    setInsightsLoading(true);
    setInsightsError(null);
    setPollStatus('processing');

    const interval = setInterval(async () => {
      try {
        console.log('Polling for insights with ID:', taskId);
        const response = await fetch(`/api/poll-insight/${taskId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Poll response received:', data);
        
        if (data.status === 'completed' && data.response) {
          console.log('Polling completed, received response:', data.response);
          setInsightsData({
            response: data.response,
            status: 'completed',
            timestamp: new Date().toISOString(),
            volumes: ["volume1", "volume11"]
          });
          setPollStatus('completed');
          clearInterval(interval);
          setPollInterval(null);
          setInsightsLoading(false);
        } else if (data.status === 'processing') {
          console.log('Still processing...');
          setPollStatus('processing');
        } else if (data.status === 'failed') {
          console.error('Polling failed:', data);
          setInsightsError('Analysis failed. Please try again.');
          setPollStatus('failed');
          clearInterval(interval);
          setPollInterval(null);
          setInsightsLoading(false);
        }
      } catch (error) {
        console.error('Polling error:', error);
        setInsightsError('Failed to get analysis results: ' + error.message);
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

  // Initiate metrics request
  const initiateMetricsRequest = async () => {
    try {
      setMetricsLoading(true);
      setMetricsError(null);

      // Use actual volume names from the request
      const volumeNames = ["volume1", "volume11"];
      const response = await fetch('/api/get-metrics', {
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
      if (!result.request_id) {
        throw new Error('No request_id received in response');
      }

      setMetricsRequestId(result.request_id);
      await pollMetricsData(result.request_id);
    } catch (error) {
      console.error('Error initiating metrics request:', error);
      setMetricsError('Failed to start metrics collection: ' + error.message);
      setMetricsLoading(false);
    }
  };

  // Transform metrics data for visualization
  const transformMetricsData = (volume, timestamp) => {
    const metrics = [
      // Latency metrics
      { metricType: 'avg_latency_us', value: volume.avg_latency_us },
      { metricType: 'access_latency_us', value: volume.access_latency_us },
      { metricType: 'read_latency_us', value: volume.read_latency_us },
      { metricType: 'other_latency_us', value: volume.other_latency_us },
      { metricType: 'latency_us', value: volume.latency_us },
      // Operations metrics
      { metricType: 'total_ops', value: volume.total_ops },
      { metricType: 'read_ops', value: volume.read_ops },
      { metricType: 'other_ops', value: volume.other_ops },
      // Read performance metrics
      { metricType: 'read_bps', value: volume.read_bps },
      { metricType: 'read_blocks', value: volume.read_blocks },
      { metricType: 'read_data_gb', value: volume.read_data_gb }
    ];

    return metrics.map(metric => ({
      timestamp,
      metricType: metric.metricType,
      value: metric.value || 0,
      volumeName: volume.volumeName,
      type: volume.volumeName
    }));
  };

  // Polling for metrics data
  const pollMetricsData = async (requestId) => {
    if (!requestId) return;

    try {
      let completed = false;
      while (!completed) {
        const response = await fetch(`/api/poll-metrics/${requestId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'completed' && data.response) {
          const timestamp = new Date().toLocaleTimeString();
          
          // Transform and update metrics history
          setMetricsHistory(prevHistory => {
            const newData = data.response.flatMap(volume => 
              transformMetricsData(volume, timestamp)
            );

            const combinedData = [...prevHistory, ...newData];
            
            // Keep only last 10 minutes of data
            const latestTimestamps = Array.from(new Set(combinedData.map(item => item.timestamp)))
              .sort()
              .slice(-10);
            
            return combinedData.filter(item => latestTimestamps.includes(item.timestamp));
          });

          setMetricsData(data.response);
          setLastMetricsUpdate(new Date());
          completed = true;
        } else if (data.status === 'failed') {
          throw new Error('Metrics polling failed');
        } else {
          // Wait for 2 seconds before polling again
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      setMetricsLoading(false);
    } catch (error) {
      console.error('Error polling metrics:', error);
      setMetricsError('Failed to get metrics: ' + error.message);
      setMetricsLoading(false);
    }
  };

  // Sequential metrics collection with fixed interval
  const startSequentialMetricsCollection = async () => {
    if (metricsInterval) {
      clearInterval(metricsInterval);
      setMetricsInterval(null);
    }

    const collectMetrics = async () => {
      try {
        setMetricsLoading(true);
        setMetricsError(null);

        // Start new metrics request
        const volumeNames = ["volume1", "volume11"];
        const response = await fetch('/api/get-metrics', {
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
        if (!result.request_id) {
          throw new Error('No request_id received in response');
        }

        // Wait for the complete response from poll-metrics
        await pollMetricsData(result.request_id);

        // Schedule the next collection after current one is complete
        const timer = setTimeout(() => {
          if (activeTab === 'metrics') {
            collectMetrics();
          }
        }, 60000); // Wait 60 seconds before next collection

        setMetricsInterval(timer);
      } catch (error) {
        console.error('Error in metrics collection:', error);
        setMetricsError('Failed to collect metrics: ' + error.message);
        setMetricsLoading(false);

        // Retry after error
        const timer = setTimeout(() => {
          if (activeTab === 'metrics') {
            collectMetrics();
          }
        }, 60000);
        setMetricsInterval(timer);
      }
    };

    // Start the first collection
    await collectMetrics();
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'insights') {
      // When switching to insights tab, always start a new request
      setInsightsRequestInitiated(false);
      setInsightsRequestId(null);
      setInsightsData(null);
      setInsightsError(null);
      setPollStatus(null);
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
      initiateInsightsRequest(poolId);
    } else if (key === 'metrics') {
      // Reset metrics state when switching to the tab
      setMetricsHistory([]);
      setMetricsData([]);
      setMetricsError(null);
      
      // Start sequential metrics collection
      startSequentialMetricsCollection();
    }
  };

  // Effect to handle metrics polling
  useEffect(() => {
    if (activeTab === 'metrics') {
      // Start initial metrics collection
      initiateMetricsRequest();

      // Set up polling interval (every minute)
      const interval = setInterval(() => {
        initiateMetricsRequest();
      }, 60000); // 1 minute

      // Cleanup function
      return () => {
        clearInterval(interval);
        setMetricsHistory([]);
        setMetricsData(null);
        setMetricsRequestId(null);
        setMetricsError(null);
        setMetricsLoading(false);
      };
    }
  }, [activeTab]);

  // Initiate insights request when pool is loaded
  const initiateInsightsRequest = async (poolId) => {
    if (insightsRequestInitiated) {
      console.log('Insights request already initiated, skipping...');
      return;
    }
    
    try {
      console.log('Initiating insights request for pool:', poolId);
      setInsightsRequestInitiated(true);
      setInsightsLoading(true);
      
      // Use hardcoded volume names for testing
      const volumeNames = ["volume1", "volume11"];
      console.log('Requesting insights for volumes:', volumeNames);
      
      // Call find-insight through Next.js API route
      const response = await fetch('/api/find-insight', {
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
      console.log('Find insight response:', result);
      
      if (!result.request_id) {
        throw new Error('No request_id received in response');
      }

      console.log('Setting request ID:', result.request_id);
      setInsightsRequestId(result.request_id);
      
      // Start polling immediately
      console.log('Starting polling with request ID:', result.request_id);
      startPolling(result.request_id);
      
    } catch (error) {
      console.error('Error initiating insights request:', error);
      setInsightsError('Failed to start analysis: ' + error.message);
      setInsightsRequestInitiated(false);
      setInsightsLoading(false);
    }
  };

  // Fetch metrics data
  const fetchMetricsData = async (poolId) => {
    if (!poolId) return;

    try {
      setMetricsLoading(true);
      setMetricsError(null);
      
      // For demonstration, using a static response format
      const response = await fetch(`/api/metrics?poolId=${encodeURIComponent(poolId)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const metricsResponse = await response.json();
      console.log('Metrics API response:', metricsResponse);
      
      // Transform response to match chart.js format
      const labels = metricsResponse.data.map(item => item.timestamp);
      const usageData = metricsResponse.data.map(item => item.usage);
      const limitData = metricsResponse.data.map(item => item.limit);

      setMetricsHistory({
        labels,
        datasets: [
          {
            label: 'Usage',
            data: usageData,
            borderColor: '#34a853',
            backgroundColor: 'rgba(52, 168, 83, 0.2)',
            fill: true,
          },
          {
            label: 'Limit',
            data: limitData,
            borderColor: '#fbbc04',
            backgroundColor: 'rgba(251, 188, 4, 0.2)',
            fill: true,
          }
        ]
      });
      
      setLastMetricsUpdate(new Date().toISOString());
      
    } catch (err) {
      console.error('Error fetching metrics data:', err);
      setMetricsError(err.message);
      setMetricsHistory({ labels: [], datasets: [] }); // Reset on error
    } finally {
      setMetricsLoading(false);
    }
  };

  // Polling for metrics data
  const startMetricsPolling = (poolId) => {
    if (!poolId) return;

    console.log('Starting metrics polling for poolId:', poolId);
    setMetricsLoading(true);
    setMetricsError(null);

    const interval = setInterval(async () => {
      try {
        console.log('Polling metrics data...');
        await fetchMetricsData(poolId);
      } catch (error) {
        console.error('Error during metrics polling:', error);
        setMetricsError('Failed to fetch metrics data: ' + error.message);
      }
    }, 60000); // Poll every 60 seconds

    setMetricsInterval(interval);
  };

  // Cleanup metrics polling on unmount or tab change
  useEffect(() => {
    return () => {
      if (metricsInterval) {
        clearTimeout(metricsInterval);
        setMetricsInterval(null);
      }
      setMetricsHistory([]);
      setMetricsData([]);
      setMetricsError(null);
      setMetricsLoading(false);
    };
  }, [metricsInterval]);

  // Initial data loading effect
  useEffect(() => {
    if (poolId) {
      fetchPoolDetails(poolId);
      fetchVolumes(poolId);
      // Don't initiate insights request automatically
      // It will be initiated when user clicks the insights tab
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

  const renderInsightsContent = () => {
    if (insightsLoading || pollStatus === 'processing') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', fontSize: '16px', color: '#666' }}>
            {pollStatus === 'processing' ? 'Analyzing volumes...' : 'Starting analysis...'}
          </p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Analyzing volumes: {insightsData?.volumes?.join(', ') || 'vol1, vol2, vol3'}
          </p>
          {pollStatus === 'processing' && (
            <Tag color="blue" style={{ marginTop: '8px' }}>
              Status: {pollStatus}
            </Tag>
          )}
        </div>
      );
    }

    if (insightsError) {
      return (
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
      );
    }

    if (!insightsData?.response) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', fontSize: '16px', color: '#666' }}>
            Initializing volume analysis...
          </p>
        </div>
      );
    }

    // Handle both legacy and new structured response formats
    const response = typeof insightsData.response === 'string' 
      ? { message: insightsData.response }
      : insightsData.response;

    return (
      <>
        {/* Analysis Header */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Volumes Analyzed"
                value={insightsData.volumes?.length || response.volumesAnalyzed || 3}
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

        {/* Bottlenecks Section */}
        {response.bottlenecks && (
          <Card 
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: '#52c41a' }} />
                System Health
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Alert
              message="System Status"
              description={response.bottlenecks}
              type="success"
              showIcon
              style={{ marginBottom: 8 }}
            />
          </Card>
        )}

        {/* Performance Section */}
        {response.performance && (
          <Card 
            title={
              <Space>
                <LineChartOutlined style={{ color: '#1890ff' }} />
                Performance Analysis
              </Space>
            }
            style={{ marginBottom: 16 }}
            className="performance-card"
          >
            <Alert
              message="Current Activity Status"
              description={
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {response.performance}
                </div>
              }
              type="info"
              showIcon
              icon={<ThunderboltOutlined />}
            />
          </Card>
        )}

        {/* Recommendations Section */}
        {response.recommendations && (
          <Card 
            title={
              <Space>
                <BulbOutlined style={{ color: '#52c41a' }} />
                Action Items & Recommendations
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            {Array.isArray(response.recommendations) ? (
              <Row gutter={[16, 16]}>
                {response.recommendations.map((recommendation, index) => (
                  <Col span={24} key={index}>
                    <Alert
                      message={`Recommendation #${index + 1}`}
                      description={recommendation}
                      type="info"
                      showIcon
                      icon={<BulbOutlined style={{ color: '#1890ff' }} />}
                      style={{ 
                        marginBottom: 8,
                        backgroundColor: '#f6ffed',
                        border: '1px solid #b7eb8f'
                      }}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert
                message="Recommendations"
                description={response.recommendations}
                type="info"
                showIcon
                icon={<BulbOutlined style={{ color: '#1890ff' }} />}
                style={{ 
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f'
                }}
              />
            )}
          </Card>
        )}

        {/* Usage Trends Section */}
        {response.usage_trends && (
          <Card 
            title={
              <Space>
                <AreaChartOutlined style={{ color: '#722ed1' }} />
                Current Usage Analysis
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Alert
              message="Usage Pattern Summary"
              description={
                <div style={{ 
                  padding: '16px',
                  backgroundColor: '#f9f0ff',
                  borderRadius: '4px',
                  marginTop: '8px'
                }}>
                  <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#262626' }}>
                    {response.usage_trends}
                  </div>
                </div>
              }
              type="info"
              showIcon
              icon={<AreaChartOutlined style={{ color: '#722ed1' }} />}
              style={{ 
                border: '1px solid #d3adf7',
                backgroundColor: '#f9f0ff'
              }}
            />
          </Card>
        )}

        {/* Legacy Message Display */}
        {typeof response === 'string' && (
          <Card style={{ marginBottom: 16 }}>
            <div style={{ whiteSpace: 'pre-line' }}>
              {response}
            </div>
          </Card>
        )}

        {/* Data Source Info */}
        <Card size="small">
          <div style={{ fontSize: '12px', color: '#666' }}>
            <p>Analysis completed: {new Date(insightsData.timestamp).toLocaleString()}</p>
            <p>Volumes analyzed: {insightsData.volumes?.join(', ') || 'vol1, vol2, vol3'}</p>
          </div>
        </Card>
      </>
    );
  };

  const getBaseChartConfig = (title, yAxisLabel) => ({
    padding: 'auto',
    xField: 'timestamp',
    yField: 'value',
    seriesField: 'type',
    xAxis: {
      title: { text: 'Time' },
    },
    yAxis: {
      title: { text: yAxisLabel },
      min: 0,
    },
    tooltip: {
      shared: true,
      showCrosshairs: true,
    },
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 500,
      },
    },
    smooth: true,
    legend: { position: 'top' }
  });

  const renderMetricsContent = () => {
    if (metricsLoading && !metricsData.length) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', fontSize: '16px', color: '#666' }}>Loading metrics data...</p>
        </div>
      );
    }

    if (metricsError) {
      return (
        <Alert
          message="Error Loading Metrics"
          description={metricsError}
          type="error"
          showIcon
          action={<Button size="small" onClick={initiateMetricsRequest}>Retry</Button>}
        />
      );
    }

    const renderChart = (title, metricKey, yAxisLabel, span = 24) => (
      <Col span={span}>
        <Card title={title} style={{ marginBottom: 16 }}>
          <div style={{ height: '300px' }}>
            <Line
              {...getBaseChartConfig(title, yAxisLabel)}
              data={metricsHistory.filter(item => item.metricType === metricKey)}
            />
          </div>
        </Card>
      </Col>
    );

    return (
      <>
        <Tabs defaultActiveKey="latency">
          <TabPane tab="Latency Metrics" key="latency">
            <Row gutter={[16, 16]}>
              {renderChart('Average Latency', 'avg_latency_us', 'Microseconds (μs)')}
              {renderChart('Access Latency', 'access_latency_us', 'Microseconds (μs)', 12)}
              {renderChart('Read Latency', 'read_latency_us', 'Microseconds (μs)', 12)}
              {renderChart('Other Latency', 'other_latency_us', 'Microseconds (μs)', 12)}
              {renderChart('General Latency', 'latency_us', 'Microseconds (μs)', 12)}
            </Row>
          </TabPane>

          <TabPane tab="Operations" key="operations">
            <Row gutter={[16, 16]}>
              {renderChart('Total Operations', 'total_ops', 'Operations/sec')}
              {renderChart('Read Operations', 'read_ops', 'Operations/sec', 12)}
              {renderChart('Other Operations', 'other_ops', 'Operations/sec', 12)}
            </Row>
          </TabPane>

          <TabPane tab="Read Performance" key="read">
            <Row gutter={[16, 16]}>
              {renderChart('Read Throughput', 'read_bps', 'Bytes/sec')}
              {renderChart('Read Blocks', 'read_blocks', 'Blocks', 12)}
              {renderChart('Read Data', 'read_data_gb', 'Gigabytes', 12)}
            </Row>
          </TabPane>
        </Tabs>

        {lastMetricsUpdate && (
          <div style={{ textAlign: 'right', color: '#666', fontSize: '12px', marginTop: 8 }}>
            Last updated: {lastMetricsUpdate.toLocaleString()}
          </div>
        )}
      </>
    );
  };

  // Handle sending message to NetApp Assistant
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      setIsSending(true);
      
      // Add user message to chat
      const userMessage = {
        type: 'user',
        content: messageInput,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setMessageInput('');

      // Send request to MCP server
      const response = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageInput,
          poolId: poolId,
          context: {
            pool: poolData,
            volumes: volumes,
            metrics: metricsData,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from NetApp Assistant');
      }

      const data = await response.json();
      
      // Add assistant's response to chat
      const assistantMessage = {
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error in chat:', error);
      message.error('Failed to get response from NetApp Assistant');
    } finally {
      setIsSending(false);
    }
  };

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
          {renderInsightsContent()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <LineChartOutlined />
              Metrics
            </span>
          }
          key="metrics"
        >
          {renderMetricsContent()}
        </TabPane>
      </Tabs>

      {/* Chat with NetApp Assistant */}
      <Card 
        title={
          <Space>
            <RobotOutlined style={{ color: '#52c41a' }} />
            NetApp Assistant
          </Space>
        }
        style={{ marginTop: 24 }}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: 16 }}>
          <List
            dataSource={messages}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={item.type === 'user' ? <UserOutlined /> : <RobotOutlined />} />}
                  title={item.type === 'user' ? 'You' : 'NetApp Assistant'}
                  description={
                    <div style={{ 
                      padding: '8px',
                      borderRadius: '4px',
                      backgroundColor: item.type === 'user' ? '#e6f7ff' : '#f0f0f0',
                      wordBreak: 'break-word'
                    }}>
                      {item.content}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </div>

        <Row gutter={[8, 8]}>
          <Col span={18}>
            <Input
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              onPressEnter={handleSendMessage}
              placeholder="Ask a question about your pool..."
              disabled={isSending}
              suffix={
                <Button 
                  type="primary" 
                  onClick={handleSendMessage} 
                  loading={isSending}
                  icon={<SendOutlined />}
                >
                  Send
                </Button>
              }
              style={{ 
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                height: '48px',
              }}
            />
          </Col>
          <Col span={6}>
            <Button 
              type="default" 
              onClick={() => setMessages([])} 
              style={{ width: '100%', height: '48px', borderRadius: '4px' }}
            >
              Clear Chat
            </Button>
          </Col>
        </Row>
      </Card>
    </AppLayout>
  );
}
