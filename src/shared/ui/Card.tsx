import type { FC, ReactNode } from 'react'


interface CardProps {
  children: ReactNode
  className?: string
  header?: ReactNode
  footer?: ReactNode
}

const Card: FC<CardProps> = ({
  children,
  className = '',
  header,
  footer,
}) => {
  return (
    <div className={`glass-card p-8 ${className}`}>
      {header && (
        <div className="border-b border-white/30 pb-6 mb-8">
          {header}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
      {footer && (
        <div className="border-t border-white/30 pt-6 mt-8">
          {footer}
        </div>
      )}
    </div>
  )
}

export { Card }
