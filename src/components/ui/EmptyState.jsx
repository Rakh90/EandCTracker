import { Link } from 'react-router-dom'

export default function EmptyState({ icon: Icon, title, children, ctaLabel, ctaTo }) {
  return (
    <div className="empty-state">
      {Icon && (
        <span className="icon-wrap">
          <Icon width={26} height={26} />
        </span>
      )}
      <h4>{title}</h4>
      {children && <p className="muted">{children}</p>}
      {ctaLabel && ctaTo && (
        <Link to={ctaTo}>
          <button type="button" className="primary">{ctaLabel}</button>
        </Link>
      )}
    </div>
  )
}
