# Pools API Integration

## Overview
This integration connects the NetApp Storage Pools tree component with the Google NetApp Volume Support API to dynamically fetch and display pools data.

## Features
- ✅ **API Integration**: Fetches pools data from `http://localhost:9000/v1beta/projects/81821054389/locations/australia-southeast1-b/pools`
- ✅ **Show More Icon**: Each pool has an info icon (ℹ️) that displays detailed pool information in a modal
- ✅ **Loading States**: Shows loading spinner while fetching data
- ✅ **Error Handling**: Falls back to static data if API fails
- ✅ **Refresh Functionality**: Refresh button to reload pools data
- ✅ **Responsive UI**: Clean, modern interface with Ant Design components

## API Integration Details

### API Endpoint
- **URL**: `http://localhost:9000/v1beta/projects/81821054389/locations/australia-southeast1-b/pools`
- **Method**: GET
- **Proxied through**: `/api/pools` (Next.js API route)

### Data Flow
1. Component loads → Shows loading spinner
2. Fetches data from `/api/pools` endpoint
3. `/api/pools` proxies request to external API
4. Transforms API response to tree structure
5. Displays pools with "show more" icons
6. Click info icon → Opens detailed modal

### Tree Structure
```
Pool-01 [ℹ️]
├── Volumes
│   ├── volume-01
│   └── volume-02
├── Aggregates
│   └── aggr-01
└── Storage VMs
    └── svm-01
```

## Components

### PoolsTree.js
Main component that:
- Manages state (loading, error, tree data)
- Handles API calls
- Renders tree structure with "show more" icons
- Shows pool details modal

### /api/pools/index.js
Next.js API route that:
- Proxies requests to external API
- Handles CORS and error responses
- Returns JSON data

## Usage

The integration automatically loads when the component mounts. Users can:
1. **View Pools**: See all available pools in tree format
2. **Show Details**: Click the ℹ️ icon next to any pool name
3. **Refresh Data**: Click the refresh button to reload from API
4. **Expand/Collapse**: Navigate the tree structure

## Error Handling

If the API is unavailable:
- Shows warning message
- Falls back to static demo data
- Maintains full functionality

## Future Enhancements

- Add volume and aggregate details modals
- Implement real-time updates
- Add filtering and search capabilities
- Show pool health status indicators
