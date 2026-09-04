import { useApp } from './lib/store'
import { Shell } from './components/Shell'
import { Dashboard } from './modes/Dashboard'
import { Practice } from './modes/Practice'
import { Adaptive } from './modes/Adaptive'
import { Official } from './modes/Official'
import { Analytics } from './modes/Analytics'
import { WeakSpots } from './modes/WeakSpots'

export default function App() {
  const { mode } = useApp()

  return (
    <Shell>
      {mode === 'dashboard' ? <Dashboard /> : null}
      {mode === 'practice' ? <Practice /> : null}
      {mode === 'adaptive' ? <Adaptive /> : null}
      {mode === 'official' ? <Official /> : null}
      {mode === 'weak' ? <WeakSpots /> : null}
      {mode === 'analytics' ? <Analytics /> : null}
    </Shell>
  )
}
