import { Layout, Menu, Avatar, Badge, Input, Space, Typography, Tree, Divider, FloatButton, Drawer, Card, Button } from 'antd';
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
  RobotOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import { useRouter } from 'next/router';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

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
  const router = useRouter();

  const treeData = [
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
        {
          title: 'Aggregates',
          key: 'pool-01-aggregates',
          children: [
            {
              title: 'aggr-01',
              key: 'pool-01-aggr-01',
              isLeaf: true,
            },
            {
              title: 'aggr-02',
              key: 'pool-01-aggr-02',
              isLeaf: true,
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
              isLeaf: true,
            },
            {
              title: 'svm-02',
              key: 'pool-01-svm-02',
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
        {
          title: 'Aggregates',
          key: 'pool-02-aggregates',
          children: [
            {
              title: 'aggr-03',
              key: 'pool-02-aggr-03',
              isLeaf: true,
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
        {
          title: 'Aggregates',
          key: 'pool-03-aggregates',
          children: [
            {
              title: 'aggr-04',
              key: 'pool-03-aggr-04',
              isLeaf: true,
            },
            {
              title: 'aggr-05',
              key: 'pool-03-aggr-05',
              isLeaf: true,
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
              isLeaf: true,
            },
            {
              title: 'svm-05',
              key: 'pool-03-svm-05',
              isLeaf: true,
            },
          ],
        },
      ],
    },
  ];

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
      default:
        break;
    }
  };

  const handleTreeSelect = (selectedKeys, info) => {
    console.log('Tree selected:', selectedKeys, info);
    
    // Only navigate for leaf nodes (actual items like volumes, aggregates, svms)
    if (info.node.isLeaf && selectedKeys.length > 0) {
      const key = selectedKeys[0];
      
      // Navigate to specific detail pages based on the type
      if (key.includes('volume')) {
        router.push(`/volume/${key}`);
      } else if (key.includes('aggr')) {
        router.push(`/aggregate/${key}`);
      } else if (key.includes('svm')) {
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
      default:
        return ['1'];
    }
  };

  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '2',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: '3',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#fafbfc' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme="light"
        width={280}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #4285f4, #34a853)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                N
              </div>
              <Title level={4} style={{ margin: 0, color: '#3c4043', fontWeight: 500 }}>NetApp Console</Title>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #4285f4, #34a853)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              N
            </div>
          )}
        </div>
        
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={menuItems}
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
            <Divider style={{ margin: '0 16px 16px 16px', borderColor: '#e8eaed' }}>
              <span style={{ fontSize: '12px', color: '#5f6368', fontWeight: 500 }}>Storage Pools</span>
            </Divider>
            
            <div style={{ padding: '0 16px' }}>
              <Tree
                showLine
                switcherIcon={<DownOutlined />}
                defaultExpandedKeys={['pool-01']}
                onSelect={handleTreeSelect}
                treeData={treeData}
                style={{
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e8eaed',
                  fontSize: '13px'
                }}
                className="google-cloud-tree"
              />
            </div>
          </>
        )}
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 280 }}>
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
          left: collapsed ? 80 : 280,
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