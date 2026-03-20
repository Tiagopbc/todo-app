'use client'
import { useState } from 'react'

export default function Home() {
  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState<string[]>([])

  function addTask() {
    setTasks([...tasks, task])
    setTask('')
  }

  return (
      <div style={{ padding: 40 }}>
        <h1>Lista de Tarefas</h1>
        <input
            value={task}
            onChange={(e) => setTask(e.target.value)} // Corrigido: removido o espaço em .value
            placeholder="Digite uma tarefa"
        />
        <button onClick={addTask}>Adicionar</button> {/* Corrigido: fechamento do parêntese ) para } */}

        <ul>
          {tasks.map((t, i) => (
              <li key={i}>{t}</li> // Corrigido: removido o espaço em .map e ajustada a sintaxe da key
          ))}
        </ul>
      </div>
  )
}