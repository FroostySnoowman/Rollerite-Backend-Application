import clsx from 'clsx'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  id?: string
  className?: string
  as?: 'section' | 'div'
}

export function Section({ children, id, className, as: Tag = 'section' }: Props) {
  return (
    <Tag
      id={id}
      className={clsx('py-12 sm:py-20 lg:py-24', className)}
    >
      {children}
    </Tag>
  )
}
