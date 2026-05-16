import { Link } from 'react-router';
import styles from './Header.module.css';
import backArrow from '../assets/back-arrow.svg';

function Header() {
  return (
    <>
      <div className={styles.header}>
        <Link to="/"><img className={styles.back} src={backArrow} alt='back'></img></Link>
      </div>
    </>
  );
}

export default Header;
