export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    res.status(400).json({ error: 'Missing request ID' });
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/poll_metrics/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error polling metrics:', error);
    res.status(500).json({ error: error.message });
  }
}
