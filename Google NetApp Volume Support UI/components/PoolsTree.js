import React from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Tree, Card, Typography } from 'antd';

const { Title } = Typography;

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
  const onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
    // You can add logic here to handle different selections
    // For example, navigate to different pages or show different content
  };

  const onExpand = (expandedKeys, info) => {
    console.log('expanded', expandedKeys, info);
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        NetApp Storage Pools
      </Title>
      <Card 
        title="Pool Hierarchy" 
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}
      >
        <Tree
          showLine
          switcherIcon={<DownOutlined />}
          defaultExpandedKeys={['pool-01']}
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
    </div>
  );
};

export default PoolsTree;
