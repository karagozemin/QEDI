module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.json({ 
    status: 'OK', 
    message: 'QEDI Backend API',
    network: process.env.SUI_NETWORK || 'testnet',
    timestamp: new Date().toISOString()
  });
};
