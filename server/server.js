import express from 'express';
import cors from 'cors';
import url from 'url';
import getRecipeObj from './utils/parse-recipe.js';

const PORT = process.env.PORT || 8080;
const BASE_URL = process.env.CLIENT_URL;
const ALLOWED_ORIGIN = process.env.NODE_ENV === "dev" ? `http://localhost:5173` : BASE_URL;

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const host = req.headers.origin;

  if (host !== ALLOWED_ORIGIN) {
    console.error(`Origin not allowed, origin: ${host}`);
    return res.status(403).json({ error: 'Forbidden: Origin not allowed' });
  }

  res.header('Access-Control-Allow-Origin', host);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/proxy', async (req, res) => {
  try {
    const urlParam = req.query.url;
    if (!urlParam) {
      console.error('Missing url query parameter');
      return res.status(400).json({ error: 'Missing url query parameter' });
    }

    let parsedUrl;
    try {
      parsedUrl = new url.URL(urlParam);
    } catch (err) {
      console.error('Invalid URL');
      return res.status(400).json({ error: 'Invalid URL' });
    }

    let recipe;
    try {
      recipe = await getRecipeObj(parsedUrl);
      console.log(recipe);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: `${err}`,
      });
    }

    res.json({
      url: parsedUrl,
      recipe,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running at http://localhost:${PORT}`);
  console.log(`Only allowing requests from: ${ALLOWED_ORIGIN}`);
});
