import React from 'react';
import Layout from '../components/Layout';
import { Typography, Card } from 'antd';

const { Title, Paragraph } = Typography;

const SettingsPage = () => {
  return (
    <Layout>
      <div>
        <Title level={2}>Settings</Title>
        <Card>
          <Paragraph>
            Application settings and configuration options will be available here.
          </Paragraph>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
