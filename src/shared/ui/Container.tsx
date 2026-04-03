import React, { type ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'main'
}

const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  as = 'div',
}) => {
  const Element = as as any
  return (
    <Element className={`max-w-7xl mx-auto px-6 py-12 ${className}`}>
      {children}
    </Element>
  )
}

export { Container }

