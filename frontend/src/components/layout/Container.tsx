import clsx from 'clsx'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export function Container({ children, className }: Props) {
  return (
    <div
      className={clsx(
        'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </div>
  )
}
