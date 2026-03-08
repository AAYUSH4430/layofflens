import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Add 1 visitor, expire after 5 minutes
    const key = 'active_visitors';
    const visitorId = Math.random().toString(36).slice(2);

    await redis.setex(`visitor:${visitorId}`, 300, 1);

    // Count all active visitors
    const keys = await redis.keys('visitor:*');
    const count = keys.length;

    res.status(200).json({ count });
  } catch (error) {
    console.error('Visitors error:', error);
    res.status(500).json({ count: 0 });
  }
}