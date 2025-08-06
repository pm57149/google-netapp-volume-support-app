import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { Typography, Card, Descriptions, Progress, Row, Col, Statistic, Table, Tag } from 'antd';

const { Title } = Typography;

const AggregateDetail = () => {
  const router = useRouter();
  const { aggregateId } = router.query;

  // Extract aggregate name from the aggregateId
  const aggregateName = aggregateId ? aggregateId.split('-').pop() : '';

  // Mock data for the aggregate
  const aggregateData = {
    name: aggregateName,
    totalSize: '2 TB',
    usedSize: '1.2 TB',
    availableSize: '800 GB',
    usagePercentage: 60,
    state: 'Online',
    raidType: 'RAID-DP',
    pool: aggregateId ? aggregateId.split('-')[0] + '-' + aggregateId.split('-')[1] : '',
    diskCount: 24,
    spareDisks: 2,
    volumes: 8
  };

  const volumeColumns = [
    {
      title: 'Volume Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Used',
      dataIndex: 'used',
      key: 'used',
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: (state) => (
        <Tag color={state === 'Online' ? 'green' : 'red'}>{state}</Tag>
      ),
    },
  ];

  const volumeData = [
    {
      key: '1',
      name: 'volume-01',
      size: '200 GB',
      used: '120 GB',
      state: 'Online',
    },
    {
      key: '2',
      name: 'volume-02',
      size: '300 GB',
      used: '180 GB',
      state: 'Online',
    },
    {
      key: '3',
      name: 'volume-03',
      size: '150 GB',
      used: '90 GB',
      state: 'Online',
    },
  ];

  const diskColumns = [
    {
      title: 'Disk ID',
      dataIndex: 'diskId',
      key: 'diskId',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
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
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : status === 'Spare' ? 'blue' : 'red'}>
          {status}
        </Tag>
      ),
    },
  ];

  const diskData = [
    {
      key: '1',
      diskId: 'disk-001',
      type: 'SSD',
      size: '960 GB',
      status: 'Active',
    },
    {
      key: '2',
      diskId: 'disk-002',
      type: 'SSD',
      size: '960 GB',
      status: 'Active',
    },
    {
      key: '3',
      diskId: 'disk-003',
      type: 'SSD',
      size: '960 GB',
      status: 'Spare',
    },
  ];

  return (
    <Layout>
      <div>
        <Title level={2}>Aggregate Details: {aggregateName}</Title>
        
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic title="Total Size" value={aggregateData.totalSize} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Used Space" value={aggregateData.usedSize} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Total Disks" value={aggregateData.diskCount} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Volumes" value={aggregateData.volumes} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="Aggregate Information">
              <Descriptions column={1}>
                <Descriptions.Item label="Aggregate Name">{aggregateData.name}</Descriptions.Item>
                <Descriptions.Item label="Pool">{aggregateData.pool}</Descriptions.Item>
                <Descriptions.Item label="State">{aggregateData.state}</Descriptions.Item>
                <Descriptions.Item label="RAID Type">{aggregateData.raidType}</Descriptions.Item>
                <Descriptions.Item label="Total Disks">{aggregateData.diskCount}</Descriptions.Item>
                <Descriptions.Item label="Spare Disks">{aggregateData.spareDisks}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Storage Usage">
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Used Space</span>
                  <span>{aggregateData.usagePercentage}%</span>
                </div>
                <Progress 
                  percent={aggregateData.usagePercentage} 
                  status={aggregateData.usagePercentage > 80 ? 'exception' : 'active'}
                  strokeColor={aggregateData.usagePercentage > 80 ? '#ff4d4f' : '#1890ff'}
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <Row>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                        {aggregateData.usedSize}
                      </div>
                      <div style={{ color: '#666' }}>Used</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                        {aggregateData.availableSize}
                      </div>
                      <div style={{ color: '#666' }}>Available</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="Volumes in this Aggregate">
              <Table 
                columns={volumeColumns} 
                dataSource={volumeData}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Disk Information">
              <Table 
                columns={diskColumns} 
                dataSource={diskData}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default AggregateDetail;
