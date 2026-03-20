// Buscar todas as tarefas
async function loadTasks() {
    const { data } = await supabase
        .from('tasks')
        .select('*')

    setTasks(data ?? [])
}

// Salvar nova tarefa
async function addTask() {
    await supabase
        .from('tasks')
        .insert({ title: task })

    setTask('') // Limpa o input
    loadTasks() // Atualiza a lista na tela
}

// Carregar ao abrir a página
useEffect(() => {
    loadTasks()
}, [])