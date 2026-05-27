/** Mensagens amigáveis para erros do Supabase Auth e API */
export function mapAuthError(message: string): string {
  const m = message.toLowerCase()

  if (
    m.includes('user already registered') ||
    m.includes('already been registered') ||
    m.includes('already exists')
  ) {
    return 'Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.'
  }

  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'E-mail ou senha incorretos. Verifique os dados e tente novamente.'
  }

  if (m.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'
  }

  if (
    m.includes('password should be at least') ||
    m.includes('password is too short') ||
    m.includes('weak password')
  ) {
    return 'A senha deve ter pelo menos 6 caracteres.'
  }

  if (m.includes('invalid email') || m.includes('unable to validate email')) {
    return 'Informe um e-mail válido.'
  }

  if (
    m.includes('fetch') ||
    m.includes('network') ||
    m.includes('failed to fetch') ||
    m.includes('connection')
  ) {
    return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
  }

  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  }

  return message
}

export function mapDbError(message: string): string {
  const m = message.toLowerCase()

  if (m.includes('duplicate key') || m.includes('unique constraint')) {
    return 'Este registro já existe no banco de dados.'
  }

  if (m.includes('permission denied') || m.includes('row-level security')) {
    return 'Sem permissão para esta operação. Faça login novamente.'
  }

  if (m.includes('relation') && m.includes('does not exist')) {
    return 'Banco não configurado. Execute o script supabase/setup_completo.sql no Supabase.'
  }

  if (m.includes('fetch') || m.includes('network')) {
    return 'Erro de conexão com o banco de dados. Tente novamente.'
  }

  return message
}
