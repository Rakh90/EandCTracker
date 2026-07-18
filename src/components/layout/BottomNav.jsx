import { NavLink } from 'react-router-dom'
import { IconHome, IconChart, IconSpark, IconGear } from '../ui/Icons'

const ITEMS = [
  { to: '/', label: 'Today', Icon: IconHome },
  { to: '/dashboard', label: 'Dashboard', Icon: IconChart },
  { to: '/insights', label: 'Insights', Icon: IconSpark },
  { to: '/settings', label: 'Settings', Icon: IconGear },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon width={20} height={20} strokeWidth={1.8} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
