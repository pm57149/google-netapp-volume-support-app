import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { Typography, Card, Descriptions, Progress, Row, Col, Statistic, Table } from 'antd';

const { Title } = Typography;

const VolumeDetail = () => {
  const router = useRouter();
  const { volumeId } = router.query;

  // Extract volume name from the volumeId
  const volumeName = volumeId ? volumeId.split('-').pop() : '';

  // Mock data for the volume
  const volumeData = {
    name: volumeName,
    size: '500 GB',
    used: '320 GB',
    available: '180 GB',
    usagePercentage: 64,
    state: 'Online',
    type: 'RW',
    pool: volumeId ? volumeId.split('-')[0] + '-' + volumeId.split('-')[1] : '',
    exportPolicy: 'default',
    protocol: 'NFS, CIFS',
    snapshots: 12
  };

  const columns = [
    {
      title: 'Snapshot Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const snapshotData = [
    {
      key: '1',
      name: `${volumeName}_snapshot_001`,
      created: '2024-01-15 10:30:00',
      size: '45 GB',
      status: 'Valid',
    },
    {
      key: '2',
      name: `${volumeName}_snapshot_002`,
      created: '2024-01-14 10:30:00',
      size: '43 GB',
      status: 'Valid',
    },
    {
      key: '3',
      name: `${volumeName}_snapshot_003`,
      created: '2024-01-13 10:30:00',
      size: '41 GB',
      status: 'Valid',
    },
  ];

  return (
    <Layout>
      <div>
        <div style={{ 
          marginBottom: 24,
          padding: '16px 0',
          borderBottom: '1px solid #e8eaed'
        }}>
          <Title level={2} style={{ margin: 0, color: '#3c4043', fontWeight: 400 }}>
            Volume: {volumeName}
          </Title>
          <div style={{ color: '#5f6368', marginTop: 4, fontSize: '14px' }}>
            Storage details and management for {volumeName}
          </div>
        </div>
        
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card style={{ 
              border: '1px solid #e8eaed',
              borderRadius: '8px',
              boxShadow: 'none'
            }}>
              <Statistic 
                title="Total Size" 
                value={volumeData.size}
                titleStyle={{ color: '#5f6368', fontSize: '14px' }}
                valueStyle={{ color: '#3c4043', fontWeight: 400 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ 
              border: '1px solid #e8eaed',
              borderRadius: '8px',
              boxShadow: 'none'
            }}>
              <Statistic 
                title="Used Space" 
                value={volumeData.used}
                titleStyle={{ color: '#5f6368', fontSize: '14px' }}
                valueStyle={{ color: '#3c4043', fontWeight: 400 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ 
              border: '1px solid #e8eaed',
              borderRadius: '8px',
              boxShadow: 'none'
            }}>
              <Statistic 
                title="Available Space" 
                value={volumeData.available}
                titleStyle={{ color: '#5f6368', fontSize: '14px' }}
                valueStyle={{ color: '#3c4043', fontWeight: 400 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ 
              border: '1px solid #e8eaed',
              borderRadius: '8px',
              boxShadow: 'none'
            }}>
              <Statistic 
                title="Snapshots" 
                value={volumeData.snapshots}
                titleStyle={{ color: '#5f6368', fontSize: '14px' }}
                valueStyle={{ color: '#3c4043', fontWeight: 400 }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="Volume Information">
              <Descriptions column={1}>
                <Descriptions.Item label="Volume Name">{volumeData.name}</Descriptions.Item>
                <Descriptions.Item label="Pool">{volumeData.pool}</Descriptions.Item>
                <Descriptions.Item label="State">{volumeData.state}</Descriptions.Item>
                <Descriptions.Item label="Type">{volumeData.type}</Descriptions.Item>
                <Descriptions.Item label="Protocol">{volumeData.protocol}</Descriptions.Item>
                <Descriptions.Item label="Export Policy">{volumeData.exportPolicy}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Storage Usage">
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Used Space</span>
                  <span>{volumeData.usagePercentage}%</span>
                </div>
                <Progress 
                  percent={volumeData.usagePercentage} 
                  status={volumeData.usagePercentage > 80 ? 'exception' : 'active'}
                  strokeColor={volumeData.usagePercentage > 80 ? '#ea4335' : '#4285f4'}
                  trailColor="#f1f3f4"
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <Row>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 400, color: '#4285f4' }}>
                        {volumeData.used}
                      </div>
                      <div style={{ color: '#5f6368' }}>Used</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 400, color: '#34a853' }}>
                        {volumeData.available}
                      </div>
                      <div style={{ color: '#5f6368' }}>Available</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>

        <Card title="Volume Snapshots">
          <Table 
            columns={columns} 
            dataSource={snapshotData}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default VolumeDetail;
