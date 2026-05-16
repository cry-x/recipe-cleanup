import * as motion from 'motion/react-client';
import sparkleLoader from '../assets/sparkle-loader.gif';
import styles from './Loading.module.css';

function Loading() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}>
      <img className={styles.loader} src={sparkleLoader} />
    </motion.div>
  );
}

export default Loading;
