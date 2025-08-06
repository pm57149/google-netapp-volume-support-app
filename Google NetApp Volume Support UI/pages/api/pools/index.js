// API route to fetch pools data
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  try {
    const response = await fetch(
      "http://localhost:9000/v1beta/projects/81821054389/locations/australia-southeast1-b/pools", 
      requestOptions
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.text();
    console.log('Raw API response:', result); // Debug log
    
    const data = JSON.parse(result);
    console.log('Parsed API data:', data); // Debug log
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching pools:', error);
    res.status(500).json({ 
      message: 'Failed to fetch pools', 
      error: error.message,
      details: 'Check if the API server at localhost:9000 is running'
    });
  }
}
