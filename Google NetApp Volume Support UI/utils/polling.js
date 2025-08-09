// Utility functions for polling API responses

/**
 * Poll a response by ID
 * @param {string} id - UUID of the task to poll
 * @returns {Promise<Object>} Polling response data
 */
export const pollResponse = async (id) => {
  if (!id) {
    throw new Error('ID is required for polling');
  }

  try {
    const response = await fetch(`/api/poll-response/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Task not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error polling response:', error);
    throw error;
  }
};

/**
 * Start continuous polling for a task
 * @param {string} id - UUID of the task to poll
 * @param {Function} onUpdate - Callback function called on each poll
 * @param {Object} options - Polling configuration
 * @returns {Object} Control object with stop() method
 */
export const startPolling = (id, onUpdate, options = {}) => {
  const {
    interval = 5000, // 5 seconds default
    maxAttempts = 120, // 10 minutes with 5s interval
    onComplete = null,
    onError = null,
    onTimeout = null
  } = options;

  let attempts = 0;
  let isPolling = true;
  let timeoutId = null;

  const poll = async () => {
    if (!isPolling || attempts >= maxAttempts) {
      if (attempts >= maxAttempts && onTimeout) {
        onTimeout(id, attempts);
      }
      return;
    }

    attempts++;

    try {
      const response = await pollResponse(id);
      
      if (onUpdate) {
        onUpdate(response);
      }

      // Check if task is complete
      if (isTaskComplete(response.status)) {
        isPolling = false;
        if (onComplete) {
          onComplete(response);
        }
        return;
      }

      // Schedule next poll
      if (isPolling) {
        timeoutId = setTimeout(poll, interval);
      }

    } catch (error) {
      console.error('Polling error:', error);
      if (onError) {
        onError(error, attempts);
      }
      
      // Continue polling on error (service might be temporarily unavailable)
      if (isPolling && attempts < maxAttempts) {
        timeoutId = setTimeout(poll, interval);
      }
    }
  };

  // Start polling
  poll();

  // Return control object
  return {
    stop: () => {
      isPolling = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
    getAttempts: () => attempts,
    isActive: () => isPolling
  };
};

/**
 * Check if a task status indicates completion
 * @param {string} status - Task status
 * @returns {boolean} True if task is complete
 */
export const isTaskComplete = (status) => {
  const completeStates = ['completed', 'failed', 'cancelled'];
  return completeStates.includes(status?.toLowerCase());
};

/**
 * Check if a task status indicates it's still processing
 * @param {string} status - Task status
 * @returns {boolean} True if task is still processing
 */
export const isTaskProcessing = (status) => {
  const processingStates = ['pending', 'in_progress', 'queued', 'running'];
  return processingStates.includes(status?.toLowerCase());
};

/**
 * Get a human-readable status message
 * @param {Object} pollResponse - Response from polling API
 * @returns {string} Human-readable status message
 */
export const getStatusMessage = (pollResponse) => {
  if (!pollResponse?.status) {
    return 'Unknown status';
  }

  const status = pollResponse.status.toLowerCase();
  const data = pollResponse.data || {};

  switch (status) {
    case 'pending':
      return data.estimatedTimeRemaining 
        ? `Queued (est. ${data.estimatedTimeRemaining})` 
        : 'Queued for processing';
    
    case 'in_progress':
    case 'running':
      const progress = data.progress || 0;
      const step = data.currentStep || 'Processing';
      return `${step} (${progress}%)`;
    
    case 'completed':
      const result = data.result || {};
      return `Completed - ${result.volumesAnalyzed || 0} volumes analyzed`;
    
    case 'failed':
      const error = data.error || {};
      return `Failed: ${error.message || 'Unknown error'}`;
    
    case 'cancelled':
      return `Cancelled: ${data.reason || 'User cancelled'}`;
    
    default:
      return `Status: ${status}`;
  }
};

/**
 * Format polling response for display
 * @param {Object} pollResponse - Response from polling API
 * @returns {Object} Formatted response data
 */
export const formatPollResponse = (pollResponse) => {
  if (!pollResponse) {
    return null;
  }

  const data = pollResponse.data || {};
  
  return {
    id: pollResponse.id,
    status: pollResponse.status,
    message: getStatusMessage(pollResponse),
    progress: data.progress || 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    completedAt: data.completedAt,
    failedAt: data.failedAt,
    cancelledAt: data.cancelledAt,
    estimatedTimeRemaining: data.estimatedTimeRemaining,
    currentStep: data.currentStep,
    stepsCompleted: data.stepsCompleted,
    totalSteps: data.totalSteps,
    result: data.result,
    error: data.error,
    downloadUrl: data.downloadUrl,
    expiresAt: data.expiresAt,
    retryable: data.retryable,
    retryAfter: data.retryAfter,
    isComplete: isTaskComplete(pollResponse.status),
    isProcessing: isTaskProcessing(pollResponse.status),
    isFallback: pollResponse.fallback || false,
    source: pollResponse.source,
    timestamp: pollResponse.timestamp
  };
};
