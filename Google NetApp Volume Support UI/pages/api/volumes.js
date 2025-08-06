export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { poolId, location = 'australia-southeast1-b' } = req.query;

  try {
    // Base URL for the NetApp API
    const baseUrl = 'http://localhost:9000/v1beta';
    const projectId = '81821054389';
    
    // Construct the API URL
    const apiUrl = `${baseUrl}/projects/${projectId}/locations/${location}/volumes`;
    
    console.log('Fetching volumes from:', apiUrl);

    // Make the API call
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Volumes API response:', data);

    // If poolId is provided, filter volumes by poolId
    let volumes = data.volumes || data || [];
    
    if (poolId) {
      volumes = volumes.filter(volume => 
        volume.poolId === poolId || 
        volume.pool === poolId ||
        volume.capacityPoolId === poolId
      );
    }

    // Transform the data to match our frontend structure
    const transformedVolumes = volumes.map(volume => ({
      resourceId: volume.resourceId || volume.name || volume.id,
      name: volume.name || volume.resourceId,
      displayName: volume.displayName || volume.name || volume.resourceId,
      poolId: volume.poolId || volume.pool || volume.capacityPoolId,
      state: volume.state || 'UNKNOWN',
      capacityBytes: volume.quotaInBytes || volume.capacityBytes || 0,
      capacityGib: volume.quotaInBytes ? Math.round(volume.quotaInBytes / (1024 * 1024 * 1024)) : 0,
      protocols: volume.protocols || [],
      network: volume.network,
      description: volume.description,
      storageClass: volume.storageClass || 'SOFTWARE',
      blockProperties: volume.blockProperties,
      createdAt: volume.createTime || volume.createdAt,
      labels: volume.labels || {},
      mountPath: volume.mountPath,
      exportPolicy: volume.exportPolicy,
      snapshotPolicy: volume.snapshotPolicy,
      backupEnabled: volume.backupConfig?.backupPolicies?.length > 0 || false,
      encryptionType: volume.encryptionType || 'SERVICE_MANAGED',
      performanceClass: volume.performanceClass || 'STANDARD'
    }));

    res.status(200).json({
      volumes: transformedVolumes,
      totalCount: transformedVolumes.length,
      location,
      poolId: poolId || null
    });

  } catch (error) {
    console.error('Error fetching volumes:', error);
    
    // Return mock data as fallback
    const mockVolumes = createMockVolumes(poolId);
    
    res.status(200).json({
      volumes: mockVolumes,
      totalCount: mockVolumes.length,
      location,
      poolId: poolId || null,
      error: error.message,
      mockData: true
    });
  }
}

// Create mock volume data for fallback
function createMockVolumes(poolId) {
  const allVolumes = [
    {
      resourceId: 'ctxtesting123vlm',
      name: 'ctxtesting123vlm',
      displayName: 'Context Testing Volume',
      poolId: 'ctxtesting123',
      state: 'READY',
      capacityBytes: 53687091200,
      capacityGib: 50,
      protocols: ['NFSv3', 'NFSv4'],
      network: 'projects/81821054389/global/networks/vsa-async-vpc',
      description: 'Testing volume for ctxtesting123 pool',
      storageClass: 'SOFTWARE',
      createdAt: '2024-01-25T16:45:00Z',
      labels: {
        environment: 'testing',
        application: 'context-testing'
      },
      mountPath: '/mnt/ctxtesting123vlm',
      backupEnabled: true,
      encryptionType: 'SERVICE_MANAGED',
      performanceClass: 'STANDARD'
    },
    {
      resourceId: 'snaptestvolume1',
      name: 'snaptestvolume1',
      displayName: 'Snap Test Volume 1',
      poolId: '587982be-0186-5946-f619-8c79cadaff74',
      state: 'READY',
      capacityBytes: 107374182400,
      capacityGib: 100,
      protocols: ['ISCSI'],
      network: 'projects/81821054389/global/networks/vsa-async-vpc',
      description: 'snaptestvolume1 description',
      storageClass: 'SOFTWARE',
      blockProperties: {
        osType: 'LINUX',
        hostGroupIds: ['5d760ce8-e9fa-adf9-566a-b4931f150b32']
      },
      createdAt: '2024-01-15T10:30:00Z',
      labels: {
        environment: 'test',
        application: 'database'
      },
      mountPath: '/mnt/snaptestvolume1',
      backupEnabled: true,
      encryptionType: 'SERVICE_MANAGED',
      performanceClass: 'STANDARD'
    },
    {
      resourceId: 'prodvolume1',
      name: 'prodvolume1',
      displayName: 'Production Volume 1',
      poolId: '587982be-0186-5946-f619-8c79cadaff74',
      state: 'READY',
      capacityBytes: 214748364800,
      capacityGib: 200,
      protocols: ['NFSv3', 'NFSv4'],
      network: 'projects/81821054389/global/networks/vsa-async-vpc',
      description: 'Production volume for main application',
      storageClass: 'HARDWARE',
      createdAt: '2024-01-10T08:00:00Z',
      labels: {
        environment: 'production',
        application: 'web-server',
        team: 'backend'
      },
      mountPath: '/mnt/prodvolume1',
      backupEnabled: true,
      encryptionType: 'CUSTOMER_MANAGED',
      performanceClass: 'PREMIUM'
    },
    {
      resourceId: 'devvolume1',
      name: 'devvolume1',
      displayName: 'Development Volume 1',
      poolId: 'dev-pool-123',
      state: 'CREATING',
      capacityBytes: 53687091200,
      capacityGib: 50,
      protocols: ['SMB'],
      network: 'projects/81821054389/global/networks/vsa-async-vpc',
      description: 'Development environment volume',
      storageClass: 'SOFTWARE',
      createdAt: '2024-02-01T14:20:00Z',
      labels: {
        environment: 'development',
        application: 'testing'
      },
      mountPath: '/mnt/devvolume1',
      backupEnabled: false,
      encryptionType: 'SERVICE_MANAGED',
      performanceClass: 'STANDARD'
    },
    {
      resourceId: 'testvolume2',
      name: 'testvolume2',
      displayName: 'Test Volume 2',
      poolId: 'test-pool-456',
      state: 'READY',
      capacityBytes: 161061273600,
      capacityGib: 150,
      protocols: ['NFSv4'],
      network: 'projects/81821054389/global/networks/vsa-async-vpc',
      description: 'Testing environment volume for QA',
      storageClass: 'HARDWARE',
      createdAt: '2024-01-20T12:15:00Z',
      labels: {
        environment: 'testing',
        application: 'qa-suite',
        team: 'qa'
      },
      mountPath: '/mnt/testvolume2',
      backupEnabled: true,
      encryptionType: 'SERVICE_MANAGED',
      performanceClass: 'PREMIUM'
    },
    {
      resourceId: 'archivevolume1',
      name: 'archivevolume1',
      displayName: 'Archive Volume 1',
      poolId: '587982be-0186-5946-f619-8c79cadaff74',
      state: 'READY',
      capacityBytes: 1073741824000,
      capacityGib: 1000,
      protocols: ['NFSv3'],
      network: 'projects/81821054389/global/networks/vsa-async-vpc',
      description: 'Long-term archive storage volume',
      storageClass: 'SOFTWARE',
      createdAt: '2023-12-01T09:30:00Z',
      labels: {
        environment: 'production',
        application: 'archive',
        retention: 'long-term'
      },
      mountPath: '/mnt/archivevolume1',
      backupEnabled: true,
      encryptionType: 'CUSTOMER_MANAGED',
      performanceClass: 'STANDARD'
    },
    {
      resourceId: 'stagingvolume1',
      name: 'stagingvolume1',
      displayName: 'Staging Volume 1',
      poolId: 'staging-pool-789',
      state: 'READY',
      capacityBytes: 80530636800,
      capacityGib: 75,
      protocols: ['ISCSI', 'NFSv3'],
      network: 'projects/81821054389/global/networks/vsa-async-vpc',
      description: 'Staging environment for pre-production testing',
      storageClass: 'SOFTWARE',
      createdAt: '2024-01-25T16:45:00Z',
      labels: {
        environment: 'staging',
        application: 'pre-prod',
        team: 'devops'
      },
      mountPath: '/mnt/stagingvolume1',
      backupEnabled: false,
      encryptionType: 'SERVICE_MANAGED',
      performanceClass: 'STANDARD'
    }
  ];

  // If poolId is specified, filter volumes for that pool
  if (poolId) {
    return allVolumes.filter(volume => 
      volume.poolId === poolId || 
      volume.pool === poolId ||
      volume.capacityPoolId === poolId
    );
  }

  return allVolumes;
}
