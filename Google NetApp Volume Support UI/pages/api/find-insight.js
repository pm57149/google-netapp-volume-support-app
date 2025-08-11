// API route to proxy requests to the find_insight endpoint
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('http://localhost:5000/find_insight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying to find_insight:', error);
    return res.status(500).json({ 
      error: 'Failed to connect to insights service',
      details: error.message 
    });
  }
}
