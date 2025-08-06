// Volume Health API
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { volumeId } = req.query;

  const healthData = {
    volumeId: volumeId || 'vol-001',
    overallHealth: 'healthy',
    score: 92,
    checks: [
      {
        name: 'Storage Utilization',
        status: 'healthy',
        value: 64,
        threshold: 85,
        message: 'Storage usage within normal limits'
      },
      {
        name: 'Performance',
        status: 'healthy',
        value: 95,
        threshold: 70,
        message: 'Excellent performance metrics'
      },
      {
        name: 'Data Integrity',
        status: 'healthy',
        value: 100,
        threshold: 99,
        message: 'No data corruption detected'
      },
      {
        name: 'Replication Status',
        status: 'healthy',
        value: 98,
        threshold: 90,
        message: 'Replication lag within acceptable limits'
      },
      {
        name: 'Snapshot Health',
        status: 'warning',
        value: 75,
        threshold: 80,
        message: 'Some snapshots are aging'
      }
    ],
    metrics: {
      availability: 99.98,
      consistency: 100,
      durability: 99.999,
      recoverability: 98.5
    },
    recommendations: [
      'Consider cleaning up snapshots older than 30 days',
      'Monitor performance during peak usage hours',
      'Schedule next integrity check for next week'
    ],
    alerts: [
      {
        level: 'info',
        message: 'Scheduled snapshot completed successfully',
        timestamp: '2024-01-15T06:00:15Z'
      },
      {
        level: 'warning',
        message: '5 snapshots are older than 30 days',
        timestamp: '2024-01-14T12:00:00Z'
      }
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