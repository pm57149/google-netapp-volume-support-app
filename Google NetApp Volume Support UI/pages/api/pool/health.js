// Pool Health API
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { poolId } = req.query;

  const healthData = {
    poolId: poolId || 'pool-001',
    overallHealth: 'good',
    score: 85,
    checks: [
      {
        name: 'Storage Capacity',
        status: 'warning',
        value: 72,
        threshold: 80,
        message: 'Approaching capacity limit'
      },
      {
        name: 'Performance',
        status: 'healthy',
        value: 92,
        threshold: 70,
        message: 'Optimal performance'
      },
      {
        name: 'Redundancy',
        status: 'healthy',
        value: 100,
        threshold: 95,
        message: 'Full redundancy maintained'
      },
      {
        name: 'Disk Health',
        status: 'warning',
        value: 78,
        threshold: 85,
        message: '2 disks showing wear indicators'
      }
    ],
    recommendations: [
      'Consider adding storage capacity within 30 days',
      'Schedule disk replacement for drives showing wear',
      'Monitor performance during peak hours'
    ],
    lastCheck: new Date().toISOString(),
    nextCheck: new Date(Date.now() + 3600000).toISOString()
  };

  res.status(200).json({
    success: true,
    data: healthData,
    timestamp: new Date().toISOString()
  });
} 