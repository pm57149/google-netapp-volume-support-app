// Pool Summary API
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { poolId } = req.query;

  const poolSummary = {
    id: poolId || 'pool-001',
    name: 'Production Pool A',
    status: 'active',
    type: 'storage',
    capacity: {
      total: '10TB',
      used: '7.2TB',
      available: '2.8TB',
      utilization: 72
    },
    performance: {
      iops: 15420,
      throughput: '2.1GB/s',
      latency: '0.8ms',
      queueDepth: 12
    },
    volumes: {
      total: 45,
      healthy: 42,
      warning: 2,
      critical: 1
    },
    lastUpdated: new Date().toISOString(),
    metadata: {
      created: '2023-01-15T10:30:00Z',
      location: 'us-east-1',
      tier: 'premium'
    }
  };

  res.status(200).json({
    success: true,
    data: poolSummary,
    timestamp: new Date().toISOString()
  });
} 