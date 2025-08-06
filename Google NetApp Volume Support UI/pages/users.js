import React from 'react';
import Layout from '../components/Layout';
import { Typography, Card } from 'antd';

const { Title, Paragraph } = Typography;

const UsersPage = () => {
  return (
    <Layout>
      <div>
        <Title level={2}>Users Management</Title>
        <Card>
          <Paragraph>
            User management functionality will be implemented here.
          </Paragraph>
        </Card>
      </div>
    </Layout>
  );
};

export default UsersPage;
