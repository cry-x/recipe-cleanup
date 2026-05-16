import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { GoogleGenAI } from '@google/genai';

const DEV = process.env.NODE_ENV === 'dev';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3-flash-preview";
const ALT_MODEL = "gemini-3.1-flash-lite-preview";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function fetchRecipeHTML(url) {
  let res;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0", // to avoid bot blocks
      },
    });
    return await res.text();
  } catch (err) {
    throw new Error(`Failed to fetch HTML: ${err}`);
  }
}

export function parseRecipeObj(html) {
  try {
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]');

    const results = [];
    scripts.each((_, el) => {
      try {
        const json = JSON.parse($(el).contents().text());
        results.push(json);
      } catch (e) {
        throw new Error(`Failed to parse JSON: ${e}`);
      }
    });

    let recipeObj;
    for (let obj of results) {
      if (obj["type"] === "Recipe" || obj["@type"] === "Recipe" ||
        (Array.isArray(obj["@type"]) && obj["@type"].includes("Recipe"))) {
        recipeObj = obj;
      } else if (obj["@graph"] && Array.isArray(obj["@graph"])) {
        recipeObj = obj["@graph"].find((el) => el["@type"] === "Recipe")
      }
    }

    return recipeObj;
  } catch (err) {
    throw new Error(`Error finding recipe object: ${err}`);
  }
}

async function aiExtractRecipe(html) {
  DEV && console.log("Extracting recipe with AI");

  const $ = cheerio.load(html);
  const text = $("body").text().split(/\s+/).join(' ').trim();

  const prompt = `
Extract recipe from given text. Return JSON with:
- title
- description
- ingredients: [{ ingredient, quantity, unit }]
- steps: [string]

If any field is missing, set value to null.

Text:
${text}
  `

  let responseText;
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    responseText = response.text;
  } catch (err) {
    console.log(`Failed to prompt model ${MODEL}. ${err}`);
    console.log(`Retrying with model ${ALT_MODEL}`);

    try {
      const response = await ai.models.generateContent({
        model: ALT_MODEL,
        contents: prompt,
      });
      responseText = response.text;
    } catch (err) {
      throw new Error(`Failed to extract recipe with AI. ${err}`);
    }
  }

  let recipeObj;
  try {
    responseText = responseText.replaceAll('```json', '');
    responseText = responseText.replaceAll('```', '');
    recipeObj = JSON.parse(responseText);
  } catch (err) {
    throw new Error(`Generated response is not valid JSON. ${err}`);
  }

  if (!recipeObj.title || !recipeObj.description || !recipeObj.ingredients || !recipeObj.steps) {
    throw new Error('Generated response is missing properties');
  }

  return recipeObj;
}

function normalizeRecipeObj(recipeObj) {
  const title = recipeObj.title || recipeObj.name || '';
  const description = recipeObj.description || recipeObj.recipeDescription || '';
  const ingredients = recipeObj.ingredients || recipeObj.recipeIngredients || recipeObj.recipeIngredient || [];
  const steps = recipeObj.steps || recipeObj.instructions || recipeObj.instruction || recipeObj.recipeInstructions || recipeObj.recipeInstruction || [];

  return {
    title,
    description,
    ingredients,
    steps
  }
}

export default async function getRecipeObj(url) {
  const html = await fetchRecipeHTML(url);
  const recipe = await aiExtractRecipe(html);
  return normalizeRecipeObj(recipe);
}
