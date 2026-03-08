export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // BLS public API - Mass Layoffs & Job Openings data - no key needed
    const response = await fetch(
      'https://api.bls.gov/publicAPI/v2/timeseries/data/JTS000000000000000TSL',
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = await response.json();
    const series = data?.Results?.series?.[0]?.data || [];

    // Build year trend from real BLS data
    const byYear = {};
    series.forEach(item => {
      const year = item.year;
      const value = parseFloat(item.value) * 1000; // BLS reports in thousands
      if (!byYear[year]) byYear[year] = 0;
      byYear[year] += value;
    });

    const yearTrend = Object.entries(byYear)
      .filter(([y]) => parseInt(y) >= 2020)
      .sort((a, b) => a[0] - b[0]);

    res.status(200).json({
      trend: {
        labels: yearTrend.map(y => y[0]),
        data: yearTrend.map(y => Math.round(y[1]))
      },
      source: 'U.S. Bureau of Labor Statistics'
    });

  } catch (error) {
    console.error('BLS error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}