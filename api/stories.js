import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET - load all stories
  if (req.method === 'GET') {
    try {
      const stories = await kv.lrange('stories', 0, 49); // get latest 50
      return res.status(200).json({ stories: stories.map(s => JSON.parse(s)) });
    } catch (err) {
      return res.status(200).json({ stories: [] });
    }
  }

  // POST - save a new story
  if (req.method === 'POST') {
    const { industry, country, text } = req.body;
    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Story too short' });
    }

    const story = {
      id: Date.now(),
      industry: industry || 'Other',
      country: country || 'Anonymous',
      text: text.trim().slice(0, 600),
      date: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    };

    try {
      await kv.lpush('stories', JSON.stringify(story));
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Could not save story' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
