export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const query = encodeURIComponent('company layoffs 2025');
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    const response = await fetch(url);
    const text = await response.text();

    // Parse the RSS XML
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];

    const news = items.slice(0, 8).map(item => {
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || '';
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || '#';
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || '';
      const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || 'News';

      const date = pubDate ? new Date(pubDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

      return { title, link, date, source };
    }).filter(item => item.title);

    res.status(200).json({ news });
  } catch (error) {
    console.error('News error:', error);
    res.status(500).json({ news: [] });
  }
}