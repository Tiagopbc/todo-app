'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
// Criamos um molde para a sua tabela do banco de dados
type Task = {
    id: number
    title: string
}

export default function Home() {
    // Tiramos o "any" e colocamos o molde "Task"
    const [tasks, setTasks] = useState<Task[]>([])
    const [task, setTask] = useState('')

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

        setTask('')
        await loadTasks() // Adicionamos o 'await' aqui
    }

    // Carregar ao abrir a página (Ajustado para o ESLint)
    useEffect(() => {
        const fetchTasks = async () => {
            await loadTasks()
        }
        fetchTasks()
    }, [])

    return (
        <div style={{ padding: '20px' }}>
            <h1>Meu App de Tarefas</h1>

            <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Digite uma nova tarefa..."
            />

            <button onClick={addTask}>Adicionar</button>

            <ul>
                {tasks.map((t) => (
                    <li key={t.id}>{t.title}</li>
                ))}
            </ul>
        </div>
    )
}