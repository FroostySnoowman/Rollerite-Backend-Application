import clsx from 'clsx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export const buttonBaseClass =
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-5 py-2.5 text-center text-sm font-semibold tracking-wide neu-border neu-shadow-md neu-press focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--fg-on-accent)] focus-visible:outline-[var(--focus)]',
  secondary:
    'bg-[var(--surface-muted)] text-[var(--fg)] focus-visible:outline-[var(--focus)]',
  ghost:
    'border-transparent bg-transparent shadow-none hover:shadow-none active:shadow-none hover:translate-x-0 hover:translate-y-0 active:translate-x-0 active:translate-y-0 text-[var(--fg)] underline-offset-4 hover:underline focus-visible:outline-[var(--focus)]',
  danger:
    'bg-[var(--surface-muted)] text-[var(--accent)] focus-visible:outline-[var(--focus)]',
}

export function buttonClassName(variant: ButtonVariant = 'primary') {
  return clsx(buttonBaseClass, variants[variant])
}
