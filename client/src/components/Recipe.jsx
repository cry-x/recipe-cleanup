import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import * as motion from 'motion/react-client';

import Loading from './Loading';
import styles from './Recipe.module.css';

const proxy = process.env.PROXY_URL || 'http://localhost:3000';

function roundNumber(num) {
  return Math.round(num * 100) / 100;
}

function Recipe() {
  const [recipe, setRecipe] = useState();
  const [ingredients, setIngredients] = useState([]);
  const [error, setError] = useState();
  let steps = recipe && (recipe.steps || []);

  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");

  if (error) throw error;

  let throttled = false;

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        let recipeObj;
        const data = sessionStorage.getItem(url);

        if (data) {
          try {
            console.log("Retrieved recipe from session storage");
            recipeObj = JSON.parse(data);
          } catch {
            sessionStorage.removeItem(url);
            throw new Error('Invalid data retrieved from session storage, removing.');
          }
        } else {
          const res = await fetch(`${proxy}/proxy?url=${url}`, { mode: "cors" });
          const data = await res.json();
          recipeObj = data.recipe;

          if (recipeObj) {
            sessionStorage.setItem(url, JSON.stringify(recipeObj));
            console.log("Saved to session storage");
          } else {
            throw new Error('Unable to parse recipe');
          }
        }

        setRecipe(recipeObj);
        setIngredients(recipeObj.ingredients);
      } catch (err) {
        console.error(err);
        setError(err);
      }
    }
    if (!recipe && !throttled) {
      fetchRecipe();
      throttled = true;
      setTimeout(() => {
        throttled = false;
      }, 5000)
    }
  }, []);

  // TODO: account for fractions, e.g. "1/2" or "1 1/2"
  const adjustIngredients = (percent) => {
    const updatedIngredients = recipe.ingredients.map((i) => {
      return { ...i, quantity: roundNumber(i.quantity * percent) }
    });
    setIngredients(updatedIngredients);
  }

  return (
    <>
      {recipe ?
        <motion.div className={styles.recipe} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}>
          <section id="recipe-header" className={styles.header}>
            <div>
              <h1>{recipe.title}</h1>
              <p className={styles.desc}>{recipe.description}</p>
            </div>
          </section>

          <section id="ingredients" className={styles.ingredientsSection}>
            <div className={styles.ingredientsOpts}>
              <p>Adjust portions:</p>
              <button onClick={() => adjustIngredients(1)}>x1</button>
              <button onClick={() => adjustIngredients(0.5)}>x1/2</button>
              <button onClick={() => adjustIngredients(0.25)}>x1/4</button>
              <button onClick={() => adjustIngredients(2)}>x2</button>
            </div>

            <h2>INGREDIENTS</h2>
            <ul className={styles.ingredientsList}>
              {ingredients.map((i, index) => (
                <li key={index}><b>{i.quantity}</b> {i.unit} {i.ingredient}</li>
              ))}
            </ul>
          </section>

          <section id="steps">
            <div>
              <h2>STEPS</h2>
              <ol className={styles.steps}>
                {steps.map((s, index) => <li className={styles.step} key={index}>{s}</li>)}
              </ol>
            </div>
          </section>
        </motion.div> : <Loading />}
    </>
  )
}

export default Recipe;
