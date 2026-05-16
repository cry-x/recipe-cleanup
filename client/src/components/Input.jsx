import { useState } from 'react';
import { useNavigate } from 'react-router';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import styles from './Input.module.css';

function isValidUrl(url) {
  if (url === '') {
    return false;
  } else {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

function removeTrailingSlashes(url) {
  return url.trim().replace(/\/+$/, '');
}

function Input() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const errorMessage = "Please enter a valid URL";

  const handleChange = (e) => {
    setValue(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const input = removeTrailingSlashes(value);
    if (isValidUrl(input)) {
      setError(false);
      navigate(`/clean?url=${input}`);
    } else {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 5000);
    }
  }

  return (
    <motion.div className={styles.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}>
      <h1>Recipe Cleanup</h1>
      <div className={styles.inputdiv}>
        <input className={styles.urlinput} type="url" value={value} onChange={handleChange} placeholder="Recipe URL" required />
        <button className={styles.submitbtn} onClick={handleSubmit}>Submit</button>
      </div>
      <AnimatePresence>
        {error && <motion.p animate={{
          x: [0, 3, -3, 0],
          transition: {
            duration: 0.1,
          },
        }} exit={{
          opacity: 0,
          transition: {
            duration: 0.5,
          },
        }} className={styles.errormsg}>{errorMessage}</motion.p>}
      </AnimatePresence>
    </motion.div >
  );
}

export default Input;
