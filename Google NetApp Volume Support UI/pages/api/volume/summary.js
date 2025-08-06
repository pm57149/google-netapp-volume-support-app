// Volume Summary API
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { volumeId } = req.query;

  const volumeSummary = {
    id: volumeId || 'vol-001',
    name: 'Database Volume A',
    status: 'active',
    type: 'block',
    capacity: {
      total: '500GB',
      used: '320GB',
      available: '180GB',
      utilization: 64
    },
    performance: {
      iops: 8500,
      readThroughput: '450MB/s',
      writeThroughput: '380MB/s',
      avgLatency: '1.2ms',
      queueDepth: 8
    },
    snapshots: {
      total: 12,
      lastSnapshot: '2024-01-15T06:00:00Z',
      nextScheduled: '2024-01-16T06:00:00Z',
      totalSize: '45GB'
    },
    replication: {
      enabled: true,
      targetPool: 'pool-002',
      lastSync: '2024-01-15T10:15:00Z',
      status: 'synchronized',
      lag: '2 minutes'
    },
    attachments: {
      instances: [
        {
          id: 'i-0123456789abcdef0',
          name: 'web-server-01',
          mountPoint: '/data',
          status: 'mounted'
        },
        {
          id: 'i-0fedcba9876543210',
          name: 'db-server-01',
          mountPoint: '/var/lib/mysql',
          status: 'mounted'
        }
      ]
    },
    lastUpdated: new Date().toISOString(),
    metadata: {
      created: '2023-02-20T14:30:00Z',
      poolId: 'pool-001',
      tier: 'high-performance',
      encryption: 'AES-256',
      tags: ['production', 'database', 'critical']
    }
  };

  res.status(200).json({
    success: true,
    data: volumeSummary,
    timestamp: new Date().toISOString()
  });
} 