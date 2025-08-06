# API Documentation

This directory contains all the API endpoints for the UI Code application, organized by functionality.

## API Structure

```
api/
├── chat/
│   └── ai.js                   # AI Chat endpoint
├── pool/
│   ├── summary.js              # Pool summary data
│   ├── health.js               # Pool health monitoring
│   ├── insights.js             # Pool analytics and insights
│   ├── error-log.js            # Pool error logging
│   └── access-control.js       # Pool access management
└── volume/
    ├── summary.js              # Volume summary data
    ├── health.js               # Volume health monitoring
    ├── insights.js             # Volume analytics and insights
    ├── error-log.js            # Volume error logging
    └── access-control.js       # Volume access management
```

## AI Chat API

### POST `/api/chat/ai`
Natural language chat interface for interacting with the system.

**Request Body:**
```json
{
  "message": "What's the status of pool-001?",
  "conversationId": "conv_123456789"
}
```

**Response:**
```json
{
  "id": "msg_1705320000000",
  "message": "Pool-001 is healthy with 72% utilization...",
  "timestamp": "2024-01-15T10:30:00Z",
  "conversationId": "conv_123456789",
  "type": "ai_response",
  "metadata": {
    "confidence": 0.95,
    "processingTime": 750
  }
}
```

## Pool APIs

### GET `/api/pool/summary?poolId=pool-001`
Get comprehensive pool summary information.

**Response includes:**
- Capacity metrics (total, used, available, utilization)
- Performance metrics (IOPS, throughput, latency)
- Volume statistics
- Metadata and configuration

### GET `/api/pool/health?poolId=pool-001`
Get detailed health assessment of the pool.

**Response includes:**
- Overall health score
- Individual health checks (capacity, performance, redundancy, disk health)
- Recommendations for improvements
- Health check schedule

### GET `/api/pool/insights?poolId=pool-001&timeRange=7d`
Get analytics and insights for the pool.

**Query Parameters:**
- `poolId`: Pool identifier
- `timeRange`: Time range for analytics (1d, 7d, 30d, 90d)

**Response includes:**
- Capacity growth trends and projections
- Performance patterns and peak hours
- Alert summaries
- Optimization suggestions with potential savings

### GET `/api/pool/error-log?poolId=pool-001&severity=warning&limit=50&offset=0`
Get filtered error logs for the pool.

**Query Parameters:**
- `poolId`: Pool identifier
- `severity`: Filter by severity (critical, error, warning, info)
- `limit`: Maximum number of logs to return (default: 50)
- `offset`: Pagination offset (default: 0)

**Response includes:**
- Paginated error logs
- Summary statistics by severity
- Resolved/unresolved counts

### Pool Access Control
- **GET** `/api/pool/access-control?poolId=pool-001` - Get access control settings
- **POST** `/api/pool/access-control` - Create new access rule
- **PUT** `/api/pool/access-control` - Update existing access rule
- **DELETE** `/api/pool/access-control` - Delete access rule

## Volume APIs

### GET `/api/volume/summary?volumeId=vol-001`
Get comprehensive volume summary information.

**Response includes:**
- Capacity and utilization metrics
- Performance statistics
- Snapshot information
- Replication status
- Instance attachments
- Metadata and tags

### GET `/api/volume/health?volumeId=vol-001`
Get detailed health assessment of the volume.

**Response includes:**
- Overall health score and status
- Individual health checks (utilization, performance, integrity, replication, snapshots)
- Key metrics (availability, consistency, durability)
- Recommendations and alerts

### GET `/api/volume/insights?volumeId=vol-001&timeRange=7d`
Get analytics and insights for the volume.

**Response includes:**
- Usage trends and growth patterns
- Performance analysis (latency, throughput)
- Snapshot efficiency metrics
- Cost optimization suggestions
- Capacity and performance predictions
- Compliance status

### GET `/api/volume/error-log?volumeId=vol-001&severity=error&component=replication`
Get filtered error logs for the volume.

**Query Parameters:**
- `volumeId`: Volume identifier
- `severity`: Filter by severity (critical, error, warning, info)
- `component`: Filter by component (snapshot-manager, replication, io-subsystem, etc.)
- `limit`: Maximum number of logs to return (default: 50)
- `offset`: Pagination offset (default: 0)

**Response includes:**
- Paginated error logs with detailed information
- Summary statistics by severity and component
- Impact assessment and resolution status

### Volume Access Control
- **GET** `/api/volume/access-control?volumeId=vol-001` - Get access control settings
- **POST** `/api/volume/access-control` - Grant access to volume
- **PUT** `/api/volume/access-control` - Update access permissions
- **DELETE** `/api/volume/access-control` - Revoke access

## Common Response Format

All APIs follow a consistent response format:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00Z",
  "message": "Optional message"
}
```

## Error Handling

Error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Authentication

Currently, these APIs are mock implementations. In a production environment, you would need to implement:

- API key authentication
- JWT token validation
- Role-based access control
- Rate limiting
- Input validation and sanitization

## Usage Examples

### Fetch Pool Summary
```javascript
const response = await fetch('/api/pool/summary?poolId=pool-001');
const data = await response.json();
console.log('Pool capacity:', data.data.capacity);
```

### Get AI Response
```javascript
const response = await fetch('/api/chat/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Show me pools with high utilization',
    conversationId: 'conv_123'
  })
});
const data = await response.json();
console.log('AI Response:', data.message);
```

### Filter Error Logs
```javascript
const response = await fetch('/api/volume/error-log?volumeId=vol-001&severity=critical&limit=10');
const data = await response.json();
console.log('Critical errors:', data.data.logs);
``` 