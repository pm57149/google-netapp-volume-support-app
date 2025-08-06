// Pool Error Log API
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { poolId, severity, limit = 50, offset = 0 } = req.query;

  const errorLogs = [
    {
      id: 'err-001',
      timestamp: '2024-01-15T10:30:15Z',
      severity: 'warning',
      component: 'disk-controller',
      message: 'Disk response time elevated (>5ms)',
      details: 'Disk /dev/sdb showing increased latency',
      poolId: poolId || 'pool-001',
      volumeId: 'vol-123',
      resolved: false
    },
    {
      id: 'err-002',
      timestamp: '2024-01-15T09:45:22Z',
      severity: 'error',
      component: 'storage-engine',
      message: 'Write operation failed',
      details: 'Failed to write block 0x4A2B to volume vol-456',
      poolId: poolId || 'pool-001',
      volumeId: 'vol-456',
      resolved: true,
      resolvedAt: '2024-01-15T09:47:30Z'
    },
    {
      id: 'err-003',
      timestamp: '2024-01-15T08:20:10Z',
      severity: 'info',
      component: 'replication',
      message: 'Automatic backup completed',
      details: 'Successfully replicated 2.1TB to secondary pool',
      poolId: poolId || 'pool-001',
      resolved: true
    },
    {
      id: 'err-004',
      timestamp: '2024-01-14T23:15:45Z',
      severity: 'critical',
      component: 'disk-array',
      message: 'Disk failure detected',
      details: 'Drive /dev/sdc has failed, initiating replacement protocol',
      poolId: poolId || 'pool-001',
      resolved: true,
      resolvedAt: '2024-01-15T02:30:00Z'
    }
  ];

  // Filter by severity if provided
  let filteredLogs = errorLogs;
  if (severity) {
    filteredLogs = errorLogs.filter(log => log.severity === severity);
  }

  // Apply pagination
  const paginatedLogs = filteredLogs.slice(offset, offset + parseInt(limit));

  const response = {
    poolId: poolId || 'pool-001',
    logs: paginatedLogs,
    pagination: {
      total: filteredLogs.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: (parseInt(offset) + parseInt(limit)) < filteredLogs.length
    },
    summary: {
      critical: errorLogs.filter(log => log.severity === 'critical').length,
      error: errorLogs.filter(log => log.severity === 'error').length,
      warning: errorLogs.filter(log => log.severity === 'warning').length,
      info: errorLogs.filter(log => log.severity === 'info').length,
      resolved: errorLogs.filter(log => log.resolved).length,
      unresolved: errorLogs.filter(log => !log.resolved).length
    },
    lastUpdated: new Date().toISOString()
  };

  res.status(200).json({
    success: true,
    data: response,
    timestamp: new Date().toISOString()
  });
} 