export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { keyword = "software engineer", country = "us", page = 1 } = req.query;

  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;

  try {
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=12&what=${encodeURIComponent(keyword)}&content-type=application/json`;

    const response = await fetch(url);
    const data = await response.json();

    const jobs = data.results.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || "Unknown Company",
      location: job.location?.display_name || "Unknown Location",
      salary: job.salary_min
        ? `$${Math.round(job.salary_min).toLocaleString()} – $${Math.round(job.salary_max).toLocaleString()}`
        : "Salary not listed",
      description: job.description?.slice(0, 150) + "...",
      url: job.redirect_url,
      created: job.created,
    }));

    res.status(200).json({ jobs, total: data.count });
  } catch (error) {
    console.error("Jobs API error:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
}