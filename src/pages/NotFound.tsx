import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-ctb-bg px-4">
      <div className="max-w-md w-full rounded-2xl border border-ctb-border bg-white p-6 shadow-md text-center space-y-4">
        <p className="text-6xl font-bold text-ctb-primary/30">404</p>
        <p className="text-lg font-semibold text-ctb-dark">Página não encontrada</p>
        <p className="text-sm text-ctb-muted">
          O endereço pode estar incorreto ou a página foi movida.
        </p>
        <div className="flex flex-col gap-2">
          <Link to="/dashboard">
            <Button type="button" className="w-full">
              Ir para o dashboard
            </Button>
          </Link>
          <Link to="/login" className="text-sm text-ctb-primary font-semibold hover:underline">
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  )
}
