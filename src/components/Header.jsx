import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const navItems = [
  { to: '/poems', label: 'شعرها' },
  { to: '/stories', label: 'داستان‌ها' },
  { to: '/notes', label: 'یادداشت‌ها' },
  { to: '/submit', label: 'ارسال اثر' },
  { to: '/contact', label: 'گفتگو' },
];

export default function Header() {
  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerBrand}>
        <NavLink to="/" end className={styles.brandLink}>
         محمد قنبری
        </NavLink>
      </div>
      <nav className={styles.headerNav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
