// Find Insights API - integrates with external insights service
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' });
  }

  try {
    const { volNames } = req.body;

    // Validate input
    if (!volNames || !Array.isArray(volNames) || volNames.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid input. volNames must be a non-empty array of volume names.' 
      });
    }

    console.log('Finding insights for volumes:', volNames);

    // Call the external insights API
    const response = await fetch('http://localhost:5000/find_insight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ volNames }),
    });

    if (!response.ok) {
      throw new Error(`Insights API error: ${response.status} ${response.statusText}`);
    }

    const insightsData = await response.json();
    
    // Transform and enhance the response if needed
    const enhancedInsights = {
      requestedVolumes: volNames,
      insights: insightsData,
      timestamp: new Date().toISOString(),
      apiVersion: '1.0',
      source: 'NetApp Insights Service',
      // If the service returns a task ID for polling, include it
      taskId: insightsData.taskId || insightsData.id || null,
      status: insightsData.status || 'completed'
    };

    res.status(200).json(enhancedInsights);

  } catch (error) {
    console.error('Error calling insights API:', error);

    // Return mock data as fallback for development
    const mockInsights = generateMockInsights(req.body.volNames || []);
    
    res.status(200).json({
      requestedVolumes: req.body.volNames || [],
      insights: mockInsights,
      timestamp: new Date().toISOString(),
      apiVersion: '1.0',
      source: 'Mock Data (Service Unavailable)',
      error: error.message,
      fallback: true,
      // Include a sample task ID for demonstration
      taskId: 'task-' + Math.random().toString(36).substr(2, 9),
      status: 'completed'
    });
  }
}

// Generate mock insights data for development/fallback
function generateMockInsights(volNames) {
  return volNames.map(volName => ({
    volumeName: volName,
    insights: {
      riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      recommendations: [
        {
          type: 'performance',
          priority: 'medium',
          description: `Consider optimizing I/O patterns for ${volName}`,
          impact: 'Could improve throughput by 15-20%'
        },
        {
          type: 'capacity',
          priority: 'low',
          description: `${volName} usage trending upward`,
          impact: 'Monitor for capacity planning'
        }
      ],
      metrics: {
        capacityUtilization: Math.round(Math.random() * 100),
        performanceScore: Math.round(50 + Math.random() * 50),
        efficiencyRating: Math.round(70 + Math.random() * 30),
        lastAnalyzed: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      anomalies: Math.random() > 0.8 ? [
        {
          type: 'unusual_access_pattern',
          severity: 'medium',
          description: `Detected abnormal access patterns in ${volName}`,
          firstSeen: new Date(Date.now() - Math.random() * 3600000).toISOString()
        }
      ] : [],
      trends: {
        capacity: Math.random() > 0.5 ? 'increasing' : 'stable',
        performance: Math.random() > 0.3 ? 'stable' : 'improving',
        errors: Math.random() > 0.9 ? 'increasing' : 'stable'
      }
    }
  }));
}
