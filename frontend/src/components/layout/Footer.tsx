import { NavLink } from 'react-router-dom'
import { Container } from './Container'

export function Footer() {
  return (
    <footer className="mt-auto border-t-[length:var(--border-width)] border-[var(--border)] bg-[var(--surface)]">
      <Container>
        <div className="flex flex-col gap-4 py-8 text-sm text-[var(--fg-muted)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6">
          <p className="min-w-0">
            © {new Date().getFullYear()} Rollerite
          </p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Footer">
            <NavLink to="/" end className="hover:text-[var(--fg)]">
              Home
            </NavLink>
            <NavLink to="/tasks" className="hover:text-[var(--fg)]">
              Tasks
            </NavLink>
          </nav>
        </div>
      </Container>
    </footer>
  )
}
