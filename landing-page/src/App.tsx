import type { ReactNode } from 'react'
import Home from './pages/home/home.tsx'
import Survey from './pages/survey/survey.tsx'

type Route = {
  path: RegExp
  render: (params: string[]) => ReactNode
}

const ROUTES: Route[] = [
  { path: /^\/$/, render: () => <Home /> },
  { path: /^\/encuesta\/([^/]+)\/?$/, render: ([token]) => <Survey token={token} /> },
]

function App() {
  const { pathname } = window.location

  for (const { path, render } of ROUTES) {
    const match = pathname.match(path)
    if (match) return render(match.slice(1))
  }

  return <Home />
}

export default App
