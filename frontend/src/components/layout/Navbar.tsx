import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { Container } from './Container'

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 17.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 1.5v2M12 20.5v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1.5 12h2M20.5 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3 6.5 6.5 0 1 0 21 14.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold transition-colors',
    isActive
      ? 'bg-[var(--surface-muted)] text-[var(--fg)] neu-border neu-shadow-sm'
      : 'text-[var(--fg-muted)] hover:text-[var(--fg)]',
  )

export function Navbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b-[length:var(--border-width)] border-[var(--border)] bg-[var(--bg-page)]/95 backdrop-blur-sm">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <Container>
        <div className="flex h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:h-[4.25rem]">
          <NavLink
            to="/"
            className="font-display text-lg font-extrabold tracking-tight text-[var(--fg)] sm:text-xl"
            end
          >
            Rollerite
          </NavLink>

          <nav
            className="flex flex-wrap items-center gap-1 sm:gap-2"
            aria-label="Primary"
          >
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/tasks" className={linkClass}>
              Tasks
            </NavLink>
            <button
              type="button"
              onClick={toggleTheme}
              className="neu-border neu-shadow-sm neu-press ml-1 flex h-11 min-w-11 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface)] text-[var(--fg)]"
              aria-label={
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </nav>
        </div>
      </Container>
    </header>
  )
}
