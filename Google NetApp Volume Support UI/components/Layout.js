import { Layout, Menu, Avatar, Badge, Input, Space, Typography, Tree, Divider, FloatButton, Drawer, Card, Button, Spin, message } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined,
  LogoutOutlined,
  DatabaseOutlined,
  DownOutlined,
  MessageOutlined,
  SendOutlined,
  RobotOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  LoadingOutlined,
  SecurityScanOutlined,
  FileProtectOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

// API function to fetch pools for sidebar
const fetchPoolsForSidebar = async () => {
  try {
    const response = await fetch('/api/pools');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching pools for sidebar:', error);
    throw error;
  }
};

// API function to fetch volumes for sidebar
const fetchVolumesForSidebar = async () => {
  try {
    const response = await fetch('/api/volumes');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching volumes for sidebar:', error);
    throw error;
  }
};

// Transform API data to sidebar tree structure
const transformPoolsToSidebarTree = (poolsData, volumesData, router) => {
  console.log('Sidebar - Raw pools API response:', poolsData); // Debug log
  console.log('Sidebar - Raw volumes API response:', volumesData); // Debug log
  
  // Handle different possible API response structures for pools
  let pools = [];
  
  if (poolsData?.pools) {
    pools = poolsData.pools;
  } else if (poolsData?.capacityPools) {
    pools = poolsData.capacityPools;
  } else if (Array.isArray(poolsData)) {
    pools = poolsData;
  } else if (poolsData?.items) {
    pools = poolsData.items;
  } else {
    console.warn('Sidebar - Unknown pools API response structure:', poolsData);
    pools = [];
  }

  // Handle different possible API response structures for volumes
  let volumes = [];
  
  if (volumesData?.volumes) {
    volumes = volumesData.volumes;
  } else if (Array.isArray(volumesData)) {
    volumes = volumesData;
  } else if (volumesData?.items) {
    volumes = volumesData.items;
  } else {
    console.warn('Sidebar - Unknown volumes API response structure:', volumesData);
    volumes = [];
  }

  console.log('Sidebar - Extracted pools:', pools); // Debug log
  console.log('Sidebar - Extracted volumes:', volumes); // Debug log

  return pools.map((pool, index) => {
    // Extract pool name from different possible fields, prioritizing resourceId
    const poolName = pool.resourceId || 
                    pool.name || 
                    pool.displayName || 
                    pool.poolName || 
                    pool.capacityPoolName ||
                    pool.poolId ||
                    pool.id?.split('/').pop() ||
                    `Pool-${index + 1}`;

    // Find volumes that belong to this pool
    const poolVolumes = volumes.filter(volume => {
      const volumePoolId = volume.poolId || volume.pool || volume.capacityPoolId;
      const poolId = pool.resourceId || pool.name || pool.poolId || pool.id;
      
      return volumePoolId === poolId || 
             volumePoolId === poolName ||
             volume.poolName === poolName;
    });

    console.log(`Sidebar - Pool ${poolName} has ${poolVolumes.length} volumes:`, poolVolumes); // Debug log

    return {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ cursor: 'pointer' }}>{poolName}</span>
          <InfoCircleOutlined 
            style={{ 
              color: '#1890ff', 
              fontSize: '12px',
              cursor: 'pointer',
              padding: '2px'
            }} 
            title="Pool details"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/pool/${encodeURIComponent(poolName)}`);
            }}
          />
        </span>
      ),
      key: pool.resourceId || pool.name || pool.id || `pool-${index + 1}`,
      children: [
        {
          title: 'Volumes',
          key: `${poolName}-volumes`,
          children: poolVolumes.length > 0 ? 
            poolVolumes.map((volume, volIndex) => ({
              title: volume.name || volume.displayName || volume.resourceId || `volume-${volIndex + 1}`,
              key: `${poolName}-volume-${volume.resourceId || volume.name || volIndex + 1}`,
              isLeaf: true,
            })) : [
              {
                title: 'No volumes available',
                key: `${poolName}-no-volumes`,
                isLeaf: true,
                disabled: true,
              },
            ],
        },
      ],
    };
  });
};

// Fallback tree data
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
              isLeaf: true,
            },
            {
              title: 'volume-02',
              key: 'pool-01-volume-02',
              isLeaf: true,
            },
            {
              title: 'volume-03',
              key: 'pool-01-volume-03',
              isLeaf: true,
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
              isLeaf: true,
            },
            {
              title: 'volume-05',
              key: 'pool-02-volume-05',
              isLeaf: true,
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
              isLeaf: true,
            },
          ],
        },
      ],
    },
  ];

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hello! I\'m your NetApp Storage Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [treeData, setTreeData] = useState([]);
  const [treeLoading, setTreeLoading] = useState(true);
  const [treeError, setTreeError] = useState(null);
  const [showAllPools, setShowAllPools] = useState(false);
  const router = useRouter();

  // Load pools data for sidebar tree
  const loadSidebarPools = async () => {
    try {
      setTreeLoading(true);
      setTreeError(null);
      console.log('Sidebar - Fetching pools and volumes from API...');
      
      // Fetch both pools and volumes data in parallel
      const [poolsData, volumesData] = await Promise.all([
        fetchPoolsForSidebar(),
        fetchVolumesForSidebar()
      ]);
      
      console.log('Sidebar - Pools API Response received:', poolsData);
      console.log('Sidebar - Volumes API Response received:', volumesData);
      
      const transformedData = transformPoolsToSidebarTree(poolsData, volumesData, router);
      console.log('Sidebar - Transformed data:', transformedData);
      
      if (transformedData.length > 0) {
        setTreeData(transformedData);
        console.log(`Sidebar - Successfully loaded ${transformedData.length} pools from API`);
      } else {
        // API returned successfully but no pools found, use fallback
        console.log('Sidebar - No pools found in API response, using fallback data');
        const fallbackPools = fallbackTreeData.map((item, index) => ({
          name: item.title,
          key: item.key,
        }));
        const transformedFallbackData = transformPoolsToSidebarTree({ pools: fallbackPools }, {}, router);
        setTreeData(transformedFallbackData.length > 0 ? transformedFallbackData : fallbackTreeData);
      }
    } catch (err) {
      console.error('Sidebar - Failed to load pools and volumes:', err);
      setTreeError(err.message);
      
      // Use fallback data if API fails
      console.log('Sidebar - API failed, using fallback data');
      const fallbackPools = fallbackTreeData.map((item, index) => ({
        name: item.title,
        key: item.key,
      }));
      const transformedFallbackData = transformPoolsToSidebarTree({ pools: fallbackPools }, {}, router);
      setTreeData(transformedFallbackData.length > 0 ? transformedFallbackData : fallbackTreeData);
    } finally {
      setTreeLoading(false);
    }
  };

  useEffect(() => {
    loadSidebarPools();
  }, []);

  const handleMenuClick = (e) => {
    switch(e.key) {
      case '1':
        router.push('/');
        break;
      case '2':
        router.push('/users');
        break;
      case '3':
        router.push('/settings');
        break;
      case '4':
        // Data Protection submenu - handle in submenu items
        break;
      case '4-1':
        router.push('/data-protection/backups');
        break;
      case '4-2':
        router.push('/data-protection/backup-vaults');
        break;
      case '4-3':
        router.push('/data-protection/migrations');
        break;
      case '4-4':
        router.push('/data-protection/active-directory');
        break;
      case '5':
        // Policies submenu - handle in submenu items
        break;
      case '5-1':
        router.push('/policies');
        break;
      case '5-2':
        router.push('/policies/cmek');
        break;
      case '5-3':
        router.push('/policies/backup');
        break;
      default:
        break;
    }
  };

  const handleTreeSelect = (selectedKeys, info) => {
    console.log('Tree selected:', selectedKeys, info);
    
    // Handle pool selection (parent nodes)
    if (!info.node.isLeaf && selectedKeys.length > 0) {
      const key = selectedKeys[0];
      
      // Check if this is a "Volumes" category click
      if (key.includes('-volumes')) {
        // Extract pool name from the key
        const poolName = key.replace('-volumes', '');
        console.log('Navigating to volumes for pool:', poolName);
        router.push(`/volumes?poolId=${encodeURIComponent(poolName)}`);
        return;
      }
      
      // Extract pool name from the key (pool nodes don't have isLeaf property)
      if (!key.includes('-volumes') && !key.includes('-aggregates') && !key.includes('-svms')) {
        // This is a pool node, navigate to pool details
        const poolName = info.node.title?.props?.children?.[0]?.props?.children || 
                         info.node.title?.props?.children || 
                         key;
        
        if (typeof poolName === 'string') {
          router.push(`/pool/${encodeURIComponent(poolName)}`);
          return;
        }
      }
    }
    
    // Only navigate for leaf nodes (actual items like volumes, aggregates, svms)
    if (info.node.isLeaf && selectedKeys.length > 0) {
      const key = selectedKeys[0];
      
      // Navigate to specific detail pages based on the type
      if (key.includes('volume') && !key.includes('no-volumes')) {
        router.push(`/volume/${key}`);
      } else if (key.includes('aggr') && !key.includes('no-aggregates')) {
        router.push(`/aggregate/${key}`);
      } else if (key.includes('svm') && !key.includes('no-svms')) {
        router.push(`/svm/${key}`);
      }
    }
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      // Add user message
      const userMessage = {
        id: chatMessages.length + 1,
        type: 'user',
        message: currentMessage,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, userMessage]);
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = generateBotResponse(currentMessage);
        const botMessage = {
          id: chatMessages.length + 2,
          type: 'bot',
          message: botResponse,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botMessage]);
      }, 1000);

      setCurrentMessage('');
    }
  };

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('volume') || message.includes('storage')) {
      return 'I can help you with volume management! You can check volume details, usage statistics, and snapshots from the Pool Hierarchy on the left.';
    } else if (message.includes('aggregate') || message.includes('aggr')) {
      return 'Aggregates are storage containers that hold your volumes. You can view aggregate details including RAID information and disk usage from the tree structure.';
    } else if (message.includes('svm') || message.includes('storage vm')) {
      return 'Storage VMs (SVMs) provide data access to clients. You can manage network interfaces, export policies, and volumes within each SVM.';
    } else if (message.includes('help') || message.includes('support')) {
      return 'I can assist you with:\n• Volume management and monitoring\n• Aggregate information and disk usage\n• Storage VM configuration\n• Pool hierarchy navigation\n• General NetApp storage questions';
    } else if (message.includes('pool')) {
      return 'Storage pools contain your aggregates, volumes, and SVMs. Use the Pool Hierarchy tree on the left to navigate through your storage infrastructure.';
    } else {
      return 'I\'m here to help with your NetApp storage management. You can ask me about volumes, aggregates, storage VMs, or any other storage-related questions!';
    }
  };

  // Determine selected key based on current route
  const getSelectedKey = () => {
    switch(router.pathname) {
      case '/':
        return ['1'];
      case '/users':
        return ['2'];
      case '/settings':
        return ['3'];
      case '/data-protection/backups':
        return ['4-1'];
      case '/data-protection/backup-vaults':
        return ['4-2'];
      case '/data-protection/migrations':
        return ['4-3'];
      case '/data-protection/active-directory':
        return ['4-4'];
      case '/policies':
        return ['5-1'];
      case '/policies/cmek':
        return ['5-2'];
      case '/policies/backup':
        return ['5-3'];
      default:
        return ['1'];
    }
  };

  const topMenuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
  ];

  const bottomMenuItems = [
    {
      key: '4',
      icon: <SecurityScanOutlined />,
      label: 'Data Protection',
      children: [
        {
          key: '4-1',
          label: 'Backups',
        },
        {
          key: '4-2',
          label: 'Backup Vaults',
        },
        {
          key: '4-3',
          label: 'Migrations',
        },
        {
          key: '4-4',
          label: 'Active Directory',
        },
      ],
    },
    {
      key: '5',
      icon: <FileProtectOutlined />,
      label: 'Policies',
      children: [
        {
          key: '5-1',
          label: 'Policies',
        },
        {
          key: '5-2',
          label: 'CMEK Policies',
        },
        {
          key: '5-3',
          label: 'Backup Policies',
        },
      ],
    },
  ];

  // Get limited tree data based on showAllPools state
  const getDisplayTreeData = () => {
    if (showAllPools || treeData.length <= 5) {
      return treeData;
    }
    return treeData.slice(0, 5);
  };

  const hiddenPoolsCount = treeData.length > 5 ? treeData.length - 5 : 0;

  return (
    <Layout style={{ minHeight: '100vh', background: '#fafbfc' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme="light"
        width={320}
        style={{ 
          overflow: 'auto', 
          height: '100vh', 
          position: 'fixed', 
          left: 0,
          background: '#fff',
          borderRight: '1px solid #e8eaed',
          boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 2px 6px 2px rgba(60,64,67,.15)'
        }}
      >
        <div style={{ 
          height: 64, 
          padding: '16px', 
          borderBottom: '1px solid #e8eaed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          background: '#fff'
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img 
                src="/netapp-logo.svg" 
                alt="NetApp Logo" 
                style={{ 
                  height: 32,
                  width: 'auto'
                }}
              />
              <Title level={4} style={{ margin: 0, color: '#3c4043', fontWeight: 500 }}>Console</Title>
            </div>
          )}
          {collapsed && (
            <img 
              src="/netapp-logo.svg" 
              alt="NetApp Logo" 
              style={{ 
                height: 24,
                width: 'auto'
              }}
            />
          )}
        </div>
        
        {/* Top Menu - Dashboard */}
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={topMenuItems}
          onClick={handleMenuClick}
          style={{ 
            borderRight: 0, 
            marginBottom: 16,
            background: 'transparent'
          }}
          className="google-cloud-menu"
        />
        
        {!collapsed && (
          <>
            <div style={{ margin: '0 16px 8px 16px' }}>
              <Divider style={{ margin: 0, borderColor: '#e8eaed' }}>
                <span style={{ fontSize: '12px', color: '#5f6368', fontWeight: 500 }}>
                  Storage Pools {treeError && <span style={{ color: '#ff4d4f' }}>(API Error)</span>}
                </span>
              </Divider>
            </div>
            
            <div style={{ padding: '0 16px' }}>
              {treeLoading ? (
                <div style={{ 
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e8eaed',
                  textAlign: 'center'
                }}>
                  <Spin 
                    indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} 
                    tip="Loading..."
                  />
                </div>
              ) : (
                <>
                  <Tree
                    showLine
                    switcherIcon={<DownOutlined />}
                    defaultExpandedKeys={getDisplayTreeData().length > 0 ? [getDisplayTreeData()[0]?.key] : []}
                    onSelect={handleTreeSelect}
                    treeData={getDisplayTreeData()}
                    style={{
                      background: '#f8f9fa',
                      padding: '12px',
                      borderRadius: showAllPools || hiddenPoolsCount === 0 ? '8px' : '8px 8px 0 0',
                      border: '1px solid #e8eaed',
                      fontSize: '13px',
                      borderBottom: hiddenPoolsCount > 0 && !showAllPools ? 'none' : '1px solid #e8eaed'
                    }}
                    className="google-cloud-tree"
                  />
                  {hiddenPoolsCount > 0 && !showAllPools && (
                    <div style={{ 
                      padding: '8px 12px',
                      textAlign: 'center',
                      background: '#f8f9fa',
                      borderRadius: '0 0 8px 8px',
                      border: '1px solid #e8eaed',
                      borderTop: 'none'
                    }}>
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => setShowAllPools(true)}
                        style={{ 
                          fontSize: '12px',
                          color: '#1a73e8',
                          padding: '0',
                          height: 'auto'
                        }}
                      >
                        Show {hiddenPoolsCount} more pool{hiddenPoolsCount > 1 ? 's' : ''}
                      </Button>
                    </div>
                  )}
                  {showAllPools && treeData.length > 5 && (
                    <div style={{ 
                      padding: '8px 12px',
                      textAlign: 'center',
                      background: '#f8f9fa',
                      borderRadius: '0 0 8px 8px',
                      border: '1px solid #e8eaed',
                      borderTop: 'none'
                    }}>
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => setShowAllPools(false)}
                        style={{ 
                          fontSize: '12px',
                          color: '#1a73e8',
                          padding: '0',
                          height: 'auto'
                        }}
                      >
                        Show less
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Bottom Menu - Data Protection and Policies */}
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={getSelectedKey()}
              items={bottomMenuItems}
              onClick={handleMenuClick}
              style={{ 
                borderRight: 0, 
                marginTop: 16,
                background: 'transparent'
              }}
              className="google-cloud-menu"
            />
          </>
        )}
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 320 }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          borderBottom: '1px solid #e8eaed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          right: 0,
          left: collapsed ? 80 : 320,
          zIndex: 1000,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {collapsed ? (
              <MenuUnfoldOutlined
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '18px', cursor: 'pointer' }}
              />
            ) : (
              <MenuFoldOutlined
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '18px', cursor: 'pointer' }}
              />
            )}
            <Input
              placeholder="Search resources, projects, and more..."
              prefix={<SearchOutlined style={{ color: '#5f6368' }} />}
              style={{ 
                width: 400, 
                marginLeft: 24,
                borderRadius: '24px',
                background: '#f1f3f4',
                border: '1px solid #f1f3f4'
              }}
            />
          </div>
          <Space size="large">
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: '20px', color: '#5f6368' }} />
            </Badge>
            <Avatar 
              src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" 
              style={{ border: '2px solid #e8eaed' }}
            />
          </Space>
        </Header>
        <Content style={{ 
          margin: '88px 24px 24px 24px', 
          padding: '24px', 
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)',
          border: '1px solid #e8eaed'
        }}>
          {children}
        </Content>
      </Layout>

      {/* Floating Chat Button */}
      <FloatButton 
        icon={<MessageOutlined />}
        style={{ 
          right: 24, 
          bottom: 24,
          width: 56,
          height: 56,
          background: '#4285f4',
          boxShadow: '0 2px 5px 0 rgba(60,64,67,.3), 0 1px 10px 0 rgba(60,64,67,.15)'
        }}
        onClick={() => setChatOpen(true)}
        badge={{ 
          count: chatMessages.filter(msg => msg.type === 'bot' && msg.id > 1).length,
          style: { background: '#ea4335' }
        }}
      />

      {/* Chat Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RobotOutlined style={{ color: '#4285f4' }} />
            <span style={{ color: '#3c4043', fontWeight: 500 }}>NetApp Assistant</span>
          </div>
        }
        placement="right"
        onClose={() => setChatOpen(false)}
        open={chatOpen}
        width={400}
        styles={{
          body: { padding: 0 }
        }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Chat Messages */}
          <div style={{ 
            flex: 1, 
            padding: '16px', 
            overflowY: 'auto',
            background: '#f8f9fa'
          }}>
            {chatMessages.map((msg) => (
              <div key={msg.id} style={{ 
                marginBottom: 12,
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <Card
                  size="small"
                  style={{
                    maxWidth: '80%',
                    background: msg.type === 'user' ? '#4285f4' : '#fff',
                    color: msg.type === 'user' ? '#fff' : '#3c4043',
                    border: msg.type === 'user' ? 'none' : '1px solid #e8eaed',
                    borderRadius: '18px',
                    boxShadow: '0 1px 3px rgba(60,64,67,.3)'
                  }}
                  bodyStyle={{ 
                    padding: '12px 16px',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.message}
                  <div style={{ 
                    fontSize: '11px', 
                    opacity: 0.7, 
                    marginTop: 4,
                    textAlign: 'right'
                  }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div style={{ 
            padding: '16px', 
            borderTop: '1px solid #e8eaed',
            background: '#fff'
          }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Ask about your NetApp storage..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onPressEnter={handleSendMessage}
                style={{
                  borderRadius: '20px',
                  border: '1px solid #e8eaed'
                }}
              />
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                style={{
                  background: '#4285f4',
                  borderColor: '#4285f4',
                  borderRadius: '20px'
                }}
              />
            </Space.Compact>
          </div>
        </div>
      </Drawer>
    </Layout>
  );
};

export default AppLayout;