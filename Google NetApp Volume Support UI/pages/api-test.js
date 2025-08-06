import { useState } from 'react';
import { Button, Card, Typography, Alert } from 'antd';

const { Title, Paragraph } = Typography;

export default function ApiTest() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/pools');
      const data = await res.json();
      
      setResponse(data);
      console.log('API Test - Full Response:', data);
      
    } catch (err) {
      setError(err.message);
      console.error('API Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>API Test Page</Title>
      <Paragraph>
        This page helps debug the pools API response structure.
      </Paragraph>
      
      <Button 
        type="primary" 
        onClick={testApi} 
        loading={loading}
        style={{ marginBottom: '16px' }}
      >
        Test Pools API
      </Button>
      
      {error && (
        <Alert
          message="API Error"
          description={error}
          type="error"
          style={{ marginBottom: '16px' }}
        />
      )}
      
      {response && (
        <Card title="API Response">
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '16px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
