export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Request ID is required' });
  }

  try {
    console.log('Polling insights for ID:', id);
    const response = await fetch(`http://localhost:5000/poll_insight/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Poll insight response:', data);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in poll-insight API:', error);
    res.status(500).json({ error: 'Failed to fetch poll insights' });
  }
}
