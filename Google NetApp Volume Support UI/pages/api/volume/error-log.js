// Volume Error Log API
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { volumeId, severity, component, limit = 50, offset = 0 } = req.query;

  const errorLogs = [
    {
      id: 'vol-err-001',
      timestamp: '2024-01-15T11:45:30Z',
      severity: 'warning',
      component: 'snapshot-manager',
      message: 'Snapshot creation took longer than expected',
      details: 'Snapshot snap-20240115-114530 took 45 minutes to complete',
      volumeId: volumeId || 'vol-001',
      operation: 'create_snapshot',
      resolved: true,
      resolvedAt: '2024-01-15T12:30:00Z',
      impact: 'minimal'
    },
    {
      id: 'vol-err-002',
      timestamp: '2024-01-15T09:20:15Z',
      severity: 'error',
      component: 'replication',
      message: 'Replication sync failed',
      details: 'Network timeout while syncing to pool-002',
      volumeId: volumeId || 'vol-001',
      operation: 'replicate_data',
      resolved: true,
      resolvedAt: '2024-01-15T09:25:30Z',
      impact: 'medium',
      retryCount: 3
    },
    {
      id: 'vol-err-003',
      timestamp: '2024-01-15T08:15:45Z',
      severity: 'info',
      component: 'integrity-checker',
      message: 'Scheduled integrity check completed',
      details: 'Volume integrity verification passed with 0 errors',
      volumeId: volumeId || 'vol-001',
      operation: 'integrity_check',
      resolved: true,
      impact: 'none'
    },
    {
      id: 'vol-err-004',
      timestamp: '2024-01-14T22:30:00Z',
      severity: 'critical',
      component: 'io-subsystem',
      message: 'I/O timeout detected',
      details: 'Multiple I/O operations timed out, potential hardware issue',
      volumeId: volumeId || 'vol-001',
      operation: 'write_data',
      resolved: true,
      resolvedAt: '2024-01-14T23:15:00Z',
      impact: 'high',
      affectedBlocks: ['1024-2048', '5500-5600']
    },
    {
      id: 'vol-err-005',
      timestamp: '2024-01-14T18:45:22Z',
      severity: 'warning',
      component: 'attachment',
      message: 'Instance detachment detected',
      details: 'Instance i-0123456789abcdef0 unexpectedly detached',
      volumeId: volumeId || 'vol-001',
      operation: 'detach_volume',
      resolved: true,
      resolvedAt: '2024-01-14T18:47:30Z',
      impact: 'medium'
    },
    {
      id: 'vol-err-006',
      timestamp: '2024-01-14T14:20:10Z',
      severity: 'error',
      component: 'encryption',
      message: 'Encryption key rotation failed',
      details: 'Failed to rotate encryption key due to KMS unavailability',
      volumeId: volumeId || 'vol-001',
      operation: 'rotate_key',
      resolved: false,
      impact: 'low',
      retryScheduled: '2024-01-15T14:20:10Z'
    }
  ];

  // Apply filters
  let filteredLogs = errorLogs;
  
  if (severity) {
    filteredLogs = filteredLogs.filter(log => log.severity === severity);
  }
  
  if (component) {
    filteredLogs = filteredLogs.filter(log => log.component === component);
  }

  // Apply pagination
  const paginatedLogs = filteredLogs.slice(offset, offset + parseInt(limit));

  const response = {
    volumeId: volumeId || 'vol-001',
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
    components: {
      'snapshot-manager': errorLogs.filter(log => log.component === 'snapshot-manager').length,
      'replication': errorLogs.filter(log => log.component === 'replication').length,
      'io-subsystem': errorLogs.filter(log => log.component === 'io-subsystem').length,
      'integrity-checker': errorLogs.filter(log => log.component === 'integrity-checker').length,
      'attachment': errorLogs.filter(log => log.component === 'attachment').length,
      'encryption': errorLogs.filter(log => log.component === 'encryption').length
    },
    lastUpdated: new Date().toISOString()
  };

  res.status(200).json({
    success: true,
    data: response,
    timestamp: new Date().toISOString()
  });
} 