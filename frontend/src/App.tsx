import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'

const Home = lazy(() => import('./pages/Home'))
const TodoPage = lazy(() => import('./pages/TodoPage'))

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="pageFallback" role="status" aria-live="polite">
          Loading…
        </div>
      }
    >
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tasks" element={<TodoPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
