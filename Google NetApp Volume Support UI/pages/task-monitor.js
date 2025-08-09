import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Button, Input, Space, Alert, Progress, Tag, Spin, Divider, Row, Col, Statistic, Typography } from 'antd';
import { 
  ReloadOutlined, 
  PlayCircleOutlined, 
  StopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import AppLayout from '../components/Layout';
import { pollResponse, startPolling, formatPollResponse, isTaskComplete, isTaskProcessing } from '../utils/polling';

const { Title, Text } = Typography;

export default function TaskMonitor() {
  const router = useRouter();
  const [taskId, setTaskId] = useState('459e8c22-caf5-4c45-bb7b-bc7ad3c4bc8a'); // Default example ID
  const [pollData, setPollData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingControl, setPollingControl] = useState(null);
  const [attempts, setAttempts] = useState(0);

  // Single poll request
  const handlePollOnce = async () => {
    if (!taskId.trim()) {
      setError('Please enter a valid task ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await pollResponse(taskId.trim());
      const formatted = formatPollResponse(response);
      setPollData(formatted);
      
    } catch (err) {
      console.error('Polling error:', err);
      setError(err.message);
      setPollData(null);
    } finally {
      setLoading(false);
    }
  };

  // Start continuous polling
  const handleStartPolling = () => {
    if (!taskId.trim()) {
      setError('Please enter a valid task ID');
      return;
    }

    if (isPolling) {
      return; // Already polling
    }

    setError(null);
    setIsPolling(true);
    setAttempts(0);

    const control = startPolling(
      taskId.trim(),
      // onUpdate callback
      (response) => {
        const formatted = formatPollResponse(response);
        setPollData(formatted);
        setAttempts(control.getAttempts());
      },
      {
        interval: 3000, // Poll every 3 seconds
        maxAttempts: 200, // 10 minutes
        onComplete: (response) => {
          console.log('Task completed:', response);
          setIsPolling(false);
          setPollingControl(null);
        },
        onError: (error, attemptCount) => {
          console.error('Polling error:', error);
          setAttempts(attemptCount);
          // Don't stop polling on error, let it retry
        },
        onTimeout: (id, attemptCount) => {
          console.warn('Polling timeout for task:', id);
          setError(`Polling timeout after ${attemptCount} attempts`);
          setIsPolling(false);
          setPollingControl(null);
        }
      }
    );

    setPollingControl(control);
  };

  // Stop continuous polling
  const handleStopPolling = () => {
    if (pollingControl) {
      pollingControl.stop();
      setPollingControl(null);
    }
    setIsPolling(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingControl) {
        pollingControl.stop();
      }
    };
  }, [pollingControl]);

  // Get status icon and color
  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'queued':
        return { icon: <ClockCircleOutlined />, color: 'orange', text: 'Pending' };
      case 'in_progress':
      case 'running':
        return { icon: <Spin size="small" />, color: 'blue', text: 'Processing' };
      case 'completed':
        return { icon: <CheckCircleOutlined />, color: 'green', text: 'Completed' };
      case 'failed':
        return { icon: <ExclamationCircleOutlined />, color: 'red', text: 'Failed' };
      case 'cancelled':
        return { icon: <CloseCircleOutlined />, color: 'default', text: 'Cancelled' };
      default:
        return { icon: <EyeOutlined />, color: 'default', text: status || 'Unknown' };
    }
  };

  const statusDisplay = pollData ? getStatusDisplay(pollData.status) : null;

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#3c4043' }}>
          <ClockCircleOutlined style={{ marginRight: 8, color: '#4285f4' }} />
          Task Monitor
        </Title>
        <Text type="secondary">Monitor the status of long-running tasks and operations</Text>
      </div>

      {/* Input and Controls */}
      <Card title="Task Polling" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>Task ID:</Text>
            <Input
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="Enter task UUID (e.g., 459e8c22-caf5-4c45-bb7b-bc7ad3c4bc8a)"
              style={{ marginTop: 8 }}
            />
          </div>

          <Space>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={handlePollOnce}
              disabled={isPolling}
            >
              Poll Once
            </Button>
            {!isPolling ? (
              <Button 
                type="default" 
                icon={<PlayCircleOutlined />}
                onClick={handleStartPolling}
              >
                Start Continuous Polling
              </Button>
            ) : (
              <Button 
                type="default" 
                icon={<StopOutlined />}
                onClick={handleStopPolling}
              >
                Stop Polling
              </Button>
            )}
          </Space>

          {isPolling && (
            <Alert
              message={`Polling active - Attempt ${attempts}`}
              description="Checking task status every 3 seconds..."
              type="info"
              showIcon
              action={
                <Button size="small" onClick={handleStopPolling}>
                  Stop
                </Button>
              }
            />
          )}

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}
        </Space>
      </Card>

      {/* Poll Results */}
      {pollData && (
        <Card 
          title={
            <Space>
              {statusDisplay?.icon}
              Task Status: {statusDisplay?.text}
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Status"
                  value={statusDisplay?.text}
                  prefix={statusDisplay?.icon}
                  valueStyle={{ color: statusDisplay?.color === 'green' ? '#52c41a' : statusDisplay?.color === 'red' ? '#ff4d4f' : undefined }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Progress"
                  value={pollData.progress}
                  suffix="%"
                  prefix={<PlayCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Steps"
                  value={`${pollData.stepsCompleted || 0}/${pollData.totalSteps || 0}`}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Time Remaining"
                  value={pollData.estimatedTimeRemaining || 'Unknown'}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {pollData.progress > 0 && (
            <div style={{ marginTop: 16 }}>
              <Progress 
                percent={pollData.progress} 
                status={pollData.isComplete ? 'success' : pollData.status === 'failed' ? 'exception' : 'active'}
                strokeColor={
                  pollData.status === 'failed' ? '#ff4d4f' : 
                  pollData.isComplete ? '#52c41a' : '#1890ff'
                }
              />
              {pollData.currentStep && (
                <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                  Current step: {pollData.currentStep}
                </Text>
              )}
            </div>
          )}

          <Divider />

          {/* Task Details */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Space direction="vertical" size="small">
                <Text strong>Task ID:</Text>
                <Text code copyable>{pollData.id}</Text>
                
                <Text strong>Message:</Text>
                <Text>{pollData.message}</Text>

                {pollData.createdAt && (
                  <>
                    <Text strong>Created:</Text>
                    <Text>{new Date(pollData.createdAt).toLocaleString()}</Text>
                  </>
                )}

                {pollData.updatedAt && (
                  <>
                    <Text strong>Last Updated:</Text>
                    <Text>{new Date(pollData.updatedAt).toLocaleString()}</Text>
                  </>
                )}
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size="small">
                {pollData.completedAt && (
                  <>
                    <Text strong>Completed:</Text>
                    <Text>{new Date(pollData.completedAt).toLocaleString()}</Text>
                  </>
                )}

                {pollData.failedAt && (
                  <>
                    <Text strong>Failed:</Text>
                    <Text>{new Date(pollData.failedAt).toLocaleString()}</Text>
                  </>
                )}

                {pollData.downloadUrl && (
                  <>
                    <Text strong>Download:</Text>
                    <Button 
                      type="link" 
                      icon={<DownloadOutlined />}
                      onClick={() => window.open(pollData.downloadUrl)}
                    >
                      Download Results
                    </Button>
                  </>
                )}

                {pollData.expiresAt && (
                  <>
                    <Text strong>Expires:</Text>
                    <Text>{new Date(pollData.expiresAt).toLocaleString()}</Text>
                  </>
                )}
              </Space>
            </Col>
          </Row>

          {/* Results */}
          {pollData.result && (
            <>
              <Divider>Results</Divider>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Volumes Analyzed"
                    value={pollData.result.volumesAnalyzed || 0}
                    prefix={<DatabaseOutlined />}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Insights Generated"
                    value={pollData.result.insightsGenerated || 0}
                    prefix={<EyeOutlined />}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Recommendations"
                    value={pollData.result.recommendationsCount || 0}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Col>
              </Row>

              {pollData.result.riskAssessment && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Risk Assessment:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="red">High Risk: {pollData.result.riskAssessment.highRisk || 0}</Tag>
                    <Tag color="orange">Medium Risk: {pollData.result.riskAssessment.mediumRisk || 0}</Tag>
                    <Tag color="green">Low Risk: {pollData.result.riskAssessment.lowRisk || 0}</Tag>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error Details */}
          {pollData.error && (
            <>
              <Divider>Error Details</Divider>
              <Alert
                message={pollData.error.code || 'Error'}
                description={pollData.error.message || 'An error occurred'}
                type="error"
                showIcon
              />
              {pollData.error.details && (
                <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                  Details: {pollData.error.details}
                </Text>
              )}
              {pollData.retryable && pollData.retryAfter && (
                <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                  Retry available after: {new Date(pollData.retryAfter).toLocaleString()}
                </Text>
              )}
            </>
          )}

          {/* Source Info */}
          <Divider />
          <div style={{ fontSize: '12px', color: '#666' }}>
            <Text>Source: {pollData.source}</Text>
            <br />
            <Text>Last polled: {new Date(pollData.timestamp).toLocaleString()}</Text>
            {pollData.isFallback && (
              <div style={{ marginTop: 8 }}>
                <Alert
                  message="Using mock data"
                  description="The polling service is unavailable. Displaying sample data for demonstration."
                  type="warning"
                  showIcon
                  size="small"
                />
              </div>
            )}
          </div>
        </Card>
      )}
    </AppLayout>
  );
}
