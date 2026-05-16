import { Outlet } from 'react-router';
import styles from './Footer.module.css';
import githubLogo from '../assets/github-logo.svg';
import codeBlock from '../assets/code-block.svg';

function Footer() {
  return (
    <>
      <Outlet />
      <div className={styles.footer}>
        <p className={styles.madeWithLove}>Made with ❤</p>
        <a href='https://github.com/cmxiang'><img className={styles.links} src={githubLogo} alt='github'></img></a>
        <a href='https://crystalxiang.dev'><img className={styles.links} src={codeBlock} alt="website"></img></a>
      </div>
    </>
  );
}

export default Footer;
