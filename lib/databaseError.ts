export type DatabaseErrorLike = {
  message: string
  code?: string
}

export type FriendlyDatabaseError = {
  message: string
  status: number
}

function includesMissingColumn(message: string, columnName: string) {
  return message.toLowerCase().includes(`column tasks.${columnName} does not exist`)
}

export function getFriendlyDatabaseError(error: DatabaseErrorLike): FriendlyDatabaseError {
  const message = error.message.toLowerCase()

  if (
    includesMissingColumn(message, 'done') ||
    includesMissingColumn(message, 'user_id') ||
    message.includes("schema cache") ||
    message.includes("could not find the 'done' column of 'tasks'") ||
    message.includes("could not find the 'user_id' column of 'tasks'")
  ) {
    return {
      status: 500,
      message: 'O schema do Supabase ainda nao refletiu esta versao do app. Execute o SQL de configuracao do projeto e recarregue o schema do PostgREST com NOTIFY pgrst, \'reload schema\'.',
    }
  }

  if (message.includes('relation "public.tasks" does not exist') || message.includes('relation "tasks" does not exist')) {
    return {
      status: 500,
      message: 'A tabela tasks ainda nao existe no banco. Crie a tabela com o SQL de configuracao do projeto no Supabase.',
    }
  }

  if (message.includes('row-level security')) {
    return {
      status: 403,
      message: 'A politica de acesso da tabela tasks ainda nao foi configurada corretamente no Supabase.',
    }
  }

  return {
    status: 500,
    message: 'Nao foi possivel concluir a operacao agora. Tente novamente em instantes.',
  }
}
