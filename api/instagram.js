import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

let cache = {
  data: null,
  timestamp: 0,
};

app.get("/api/instagram", async (req, res) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Instagram access token is not configured" });
  }

  const now = Date.now();
  // 30 minutes cache = 30 * 60 * 1000 = 1,800,000 ms
  if (cache.data && now - cache.timestamp < 1800000) {
    return res.json(cache.data);
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${token}`
    );
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Instagram API error: ${response.status} - ${errText}`);
    }
    const result = await response.json();

    cache.data = result;
    cache.timestamp = now;

    res.json(result);
  } catch (error) {
    console.error("Error fetching Instagram feed:", error);
    res.status(500).json({ error: error.message || "Failed to fetch Instagram feed" });
  }
});

// Start local dev server if executed directly
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

export default app;
