// Utility functions for interacting with the insights API

/**
 * Find insights for multiple volumes
 * @param {string[]} volumeNames - Array of volume names to analyze
 * @returns {Promise<Object>} Insights data for the specified volumes
 */
export const findInsights = async (volumeNames) => {
  if (!volumeNames || !Array.isArray(volumeNames) || volumeNames.length === 0) {
    throw new Error('Volume names must be provided as a non-empty array');
  }

  try {
    const response = await fetch('/api/find-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ volNames: volumeNames }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error finding insights:', error);
    throw error;
  }
};

/**
 * Find insights for a single volume
 * @param {string} volumeName - Name of the volume to analyze
 * @returns {Promise<Object>} Insights data for the specified volume
 */
export const findVolumeInsight = async (volumeName) => {
  return findInsights([volumeName]);
};

/**
 * Process insights data and extract key metrics
 * @param {Object} insightsResponse - Response from findInsights API
 * @returns {Object} Processed insights with summary statistics
 */
export const processInsightsData = (insightsResponse) => {
  if (!insightsResponse?.insights) {
    return null;
  }

  const insights = insightsResponse.insights;
  const summary = {
    totalVolumes: insights.length,
    riskDistribution: {
      high: insights.filter(i => i.insights.riskLevel === 'high').length,
      medium: insights.filter(i => i.insights.riskLevel === 'medium').length,
      low: insights.filter(i => i.insights.riskLevel === 'low').length,
    },
    averagePerformanceScore: insights.reduce((acc, i) => acc + (i.insights.metrics?.performanceScore || 0), 0) / insights.length,
    averageCapacityUtilization: insights.reduce((acc, i) => acc + (i.insights.metrics?.capacityUtilization || 0), 0) / insights.length,
    totalRecommendations: insights.reduce((acc, i) => acc + (i.insights.recommendations?.length || 0), 0),
    totalAnomalies: insights.reduce((acc, i) => acc + (i.insights.anomalies?.length || 0), 0),
    timestamp: insightsResponse.timestamp,
    source: insightsResponse.source,
    isFallback: insightsResponse.fallback || false
  };

  return {
    summary,
    details: insights,
    raw: insightsResponse
  };
};

/**
 * Get volumes with high risk
 * @param {Object} insightsResponse - Response from findInsights API
 * @returns {Array} Array of high-risk volumes
 */
export const getHighRiskVolumes = (insightsResponse) => {
  if (!insightsResponse?.insights) {
    return [];
  }

  return insightsResponse.insights
    .filter(i => i.insights.riskLevel === 'high')
    .map(i => ({
      volumeName: i.volumeName,
      recommendations: i.insights.recommendations,
      anomalies: i.insights.anomalies,
      metrics: i.insights.metrics
    }));
};

/**
 * Get all recommendations across volumes
 * @param {Object} insightsResponse - Response from findInsights API
 * @returns {Array} Array of all recommendations sorted by priority
 */
export const getAllRecommendations = (insightsResponse) => {
  if (!insightsResponse?.insights) {
    return [];
  }

  const allRecommendations = [];
  
  insightsResponse.insights.forEach(volumeInsight => {
    if (volumeInsight.insights.recommendations) {
      volumeInsight.insights.recommendations.forEach(rec => {
        allRecommendations.push({
          ...rec,
          volumeName: volumeInsight.volumeName
        });
      });
    }
  });

  // Sort by priority: high -> medium -> low
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return allRecommendations.sort((a, b) => 
    (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
  );
};
