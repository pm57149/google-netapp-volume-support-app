export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Request ID is required' });
  }

  try {
    const response = await fetch(`http://localhost:5000/poll_response/${id}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in poll-response API:', error);
    res.status(500).json({ error: 'Failed to fetch poll response' });
  }
}
