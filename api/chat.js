export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: 'You are a compassionate and practical career advisor on LayoffLens, a platform for people affected by layoffs. You give warm, honest, actionable advice to people who have been laid off or are worried about losing their job. Focus on practical next steps, mental health, skill building especially AI tools, job search strategies, and financial advice. Keep responses concise 3-4 paragraphs max. Be human, not corporate.',
        messages: messages
      })
    });

    const data = await response.json();
    res.status(200).json({ response: data.content[0].text });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
}
