import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { Typography, Card, Descriptions, Row, Col, Statistic, Table, Tag, List } from 'antd';

const { Title } = Typography;

const SVMDetail = () => {
  const router = useRouter();
  const { svmId } = router.query;

  // Extract SVM name from the svmId
  const svmName = svmId ? svmId.split('-').pop() : '';

  // Mock data for the SVM
  const svmData = {
    name: svmName,
    state: 'Running',
    pool: svmId ? svmId.split('-')[0] + '-' + svmId.split('-')[1] : '',
    rootVolume: 'svm_root',
    allowedProtocols: ['NFS', 'CIFS', 'iSCSI'],
    adminState: 'Up',
    operationalState: 'Running',
    volumes: 6,
    lifs: 4,
    exports: 12
  };

  const lifColumns = [
    {
      title: 'LIF Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'Protocol',
      dataIndex: 'protocol',
      key: 'protocol',
      render: (protocols) => (
        <>
          {protocols.map(protocol => (
            <Tag key={protocol} color="blue">{protocol}</Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Up' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
  ];

  const lifData = [
    {
      key: '1',
      name: `${svmName}_data_lif1`,
      ip: '192.168.1.100',
      protocol: ['NFS', 'CIFS'],
      status: 'Up',
    },
    {
      key: '2',
      name: `${svmName}_data_lif2`,
      ip: '192.168.1.101',
      protocol: ['NFS'],
      status: 'Up',
    },
    {
      key: '3',
      name: `${svmName}_mgmt_lif`,
      ip: '192.168.1.102',
      protocol: ['HTTPS'],
      status: 'Up',
    },
    {
      key: '4',
      name: `${svmName}_iscsi_lif`,
      ip: '192.168.1.103',
      protocol: ['iSCSI'],
      status: 'Up',
    },
  ];

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
      title: 'Junction Path',
      dataIndex: 'junctionPath',
      key: 'junctionPath',
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
      name: `${svmName}_vol1`,
      size: '100 GB',
      junctionPath: '/vol1',
      state: 'Online',
    },
    {
      key: '2',
      name: `${svmName}_vol2`,
      size: '200 GB',
      junctionPath: '/vol2',
      state: 'Online',
    },
    {
      key: '3',
      name: `${svmName}_vol3`,
      size: '150 GB',
      junctionPath: '/vol3',
      state: 'Online',
    },
  ];

  const exportPolicies = [
    'default',
    'nfs_policy',
    'cifs_policy',
    'mixed_policy'
  ];

  return (
    <Layout>
      <div>
        <Title level={2}>Storage VM Details: {svmName}</Title>
        
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic title="Volumes" value={svmData.volumes} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Network Interfaces" value={svmData.lifs} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Export Policies" value={svmData.exports} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Status" 
                value={svmData.state}
                valueStyle={{ color: svmData.state === 'Running' ? '#3f8600' : '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="SVM Information">
              <Descriptions column={1}>
                <Descriptions.Item label="SVM Name">{svmData.name}</Descriptions.Item>
                <Descriptions.Item label="Pool">{svmData.pool}</Descriptions.Item>
                <Descriptions.Item label="Administrative State">{svmData.adminState}</Descriptions.Item>
                <Descriptions.Item label="Operational State">{svmData.operationalState}</Descriptions.Item>
                <Descriptions.Item label="Root Volume">{svmData.rootVolume}</Descriptions.Item>
                <Descriptions.Item label="Allowed Protocols">
                  {svmData.allowedProtocols.map(protocol => (
                    <Tag key={protocol} color="blue" style={{ marginRight: 4 }}>
                      {protocol}
                    </Tag>
                  ))}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Export Policies">
              <List
                size="small"
                dataSource={exportPolicies}
                renderItem={item => (
                  <List.Item>
                    <Tag color="geekblue">{item}</Tag>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Network Interfaces (LIFs)">
              <Table 
                columns={lifColumns} 
                dataSource={lifData}
                pagination={false}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="Volumes in this SVM">
              <Table 
                columns={volumeColumns} 
                dataSource={volumeData}
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default SVMDetail;
