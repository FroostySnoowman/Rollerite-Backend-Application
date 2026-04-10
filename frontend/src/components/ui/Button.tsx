import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { buttonClassName, type ButtonVariant } from './buttonClasses'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={clsx(buttonClassName(variant), className)}
      {...props}
    >
      {children}
    </button>
  )
}
