export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-block h-9 w-9 animate-spin rounded-full border-[3px] border-ctb-light border-t-ctb-primary ${className}`}
      role="status"
      aria-label="Carregando"
    />
  )
}
