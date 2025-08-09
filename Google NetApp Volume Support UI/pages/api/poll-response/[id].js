// Poll Response API - integrates with external polling service
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed. Use GET.' });
  }

  const { id } = req.query;

  // Validate input
  if (!id) {
    return res.status(400).json({ 
      message: 'Missing required parameter: id' 
    });
  }

  // Validate UUID format (basic validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ 
      message: 'Invalid ID format. Expected UUID format.' 
    });
  }

  try {
    console.log('Polling response for ID:', id);

    // Call the external polling API
    const response = await fetch(`http://localhost:5000/poll_response/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({
          message: 'Task not found',
          id,
          status: 'not_found'
        });
      }
      throw new Error(`Polling API error: ${response.status} ${response.statusText}`);
    }

    const pollingData = await response.json();
    
    // Transform and enhance the response
    const enhancedResponse = {
      id,
      status: pollingData.status || 'unknown',
      data: pollingData,
      timestamp: new Date().toISOString(),
      apiVersion: '1.0',
      source: 'NetApp Polling Service'
    };

    res.status(200).json(enhancedResponse);

  } catch (error) {
    console.error('Error calling polling API:', error);

    // Return mock data as fallback for development
    const mockResponse = generateMockPollResponse(id);
    
    res.status(200).json({
      id,
      status: mockResponse.status,
      data: mockResponse,
      timestamp: new Date().toISOString(),
      apiVersion: '1.0',
      source: 'Mock Data (Service Unavailable)',
      error: error.message,
      fallback: true
    });
  }
}

// Generate mock polling response for development/fallback
function generateMockPollResponse(id) {
  // Simulate different possible states
  const possibleStates = ['pending', 'in_progress', 'completed', 'failed', 'cancelled'];
  const randomState = possibleStates[Math.floor(Math.random() * possibleStates.length)];
  
  const baseResponse = {
    id,
    status: randomState,
    createdAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  switch (randomState) {
    case 'pending':
      return {
        ...baseResponse,
        message: 'Task is queued and waiting to be processed',
        progress: 0,
        estimatedTimeRemaining: '2-5 minutes'
      };

    case 'in_progress':
      const progress = Math.floor(Math.random() * 80) + 10; // 10-90%
      return {
        ...baseResponse,
        message: 'Task is currently being processed',
        progress,
        currentStep: 'Analyzing volume data',
        stepsCompleted: Math.floor(progress / 25),
        totalSteps: 4,
        estimatedTimeRemaining: `${Math.floor((100 - progress) / 10)} minutes`
      };

    case 'completed':
      return {
        ...baseResponse,
        message: 'Task completed successfully',
        progress: 100,
        completedAt: new Date().toISOString(),
        response: 'During our review of your storage volumes—**vol1**, **vol2**, and **vol3**—we found that there has been no activity on these volumes during the period we checked. This means there were no files read or written, and no application or user activity taking place on these volumes.\n\nBecause of this, there are no signs of performance issues or bottlenecks. However, we recommend confirming whether these volumes should currently be in use. If you expect activity on **vol1**, **vol2**, or **vol3**, please verify that they are properly connected and accessible from the systems or applications that need them.\n\nAdditionally, only **vol3** currently has a data protection policy in place. If you require similar data protection for **vol1** and **vol2**, please consider enabling the appropriate policies.\n\nIf these volumes are no longer needed, you may want to review them for potential cleanup to free up space. We also suggest keeping an eye on these volumes to ensure they are serving their intended purpose. If you notice that expected activity is still missing after these checks, it may be helpful to investigate your connected systems or applications further.\n\nIf you have questions or need help reviewing your setup, please let us know.',
        result: {
          volumesAnalyzed: 3,
          analyzedVolumes: ['vol1', 'vol2', 'vol3'],
          activityDetected: false,
          dataProtectionStatus: {
            vol1: false,
            vol2: false,
            vol3: true
          },
          recommendations: [
            'Verify volume connectivity and accessibility',
            'Enable data protection policies for vol1 and vol2',
            'Review volumes for potential cleanup if unused',
            'Monitor for expected activity patterns'
          ]
        },
        downloadUrl: `/api/download-results/${id}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };

    case 'failed':
      return {
        ...baseResponse,
        message: 'Task failed to complete',
        error: {
          code: 'ANALYSIS_ERROR',
          message: 'Unable to analyze one or more volumes',
          details: 'Volume access permissions may be insufficient'
        },
        failedAt: new Date().toISOString(),
        retryable: true,
        retryAfter: new Date(Date.now() + 300000).toISOString() // 5 minutes
      };

    case 'cancelled':
      return {
        ...baseResponse,
        message: 'Task was cancelled by user or system',
        cancelledAt: new Date().toISOString(),
        reason: 'User requested cancellation'
      };

    default:
      return baseResponse;
  }
}
