import { Link } from 'react-router-dom'
import { Container } from '../components/layout/Container'
import { buttonClassName } from '../components/ui/buttonClasses'

export default function Home() {
  return (
    <div className="flex-1 border-b-[length:var(--border-width)] border-[var(--border)] bg-[var(--surface-muted)]">
      <Container>
        <div className="mx-auto max-w-2xl py-16 sm:py-24">
          <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-2)]">
            Rollerite
          </p>
          <h1
            id="hero-heading"
            className="font-display text-4xl font-extrabold leading-tight tracking-tight text-[var(--fg)] sm:text-5xl"
          >
            Todos, <span className="text-[var(--accent)]">plain and simple</span>.
          </h1>
          <p className="mt-6 text-lg text-[var(--fg-muted)]">
            A small React app with the same bold type and chunky borders as our reference palette —
            without copying its multi-page layout. Your list lives on the{' '}
            <Link to="/tasks" className="font-semibold text-[var(--fg)] underline-offset-4 hover:underline">
              tasks
            </Link>{' '}
            page.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/tasks" className={`${buttonClassName('primary')} no-underline`}>
              Go to tasks
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
