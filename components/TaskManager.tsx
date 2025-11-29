import React, { useState, useEffect } from 'react';
import { Task, SubTask, TaskPriority } from '../types';
import { breakDownTask } from '../services/geminiService';
import { IconPlus, IconTrash, IconCheck, IconWand, IconLoader, IconListTodo } from './Icons';

export const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loadingTaskIds, setLoadingTaskIds] = useState<Set<string>>(new Set());

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('asistan_tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('asistan_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      priority: TaskPriority.MEDIUM,
      createdAt: Date.now(),
      subtasks: []
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleMagicBreakdown = async (task: Task) => {
    if (loadingTaskIds.has(task.id) || task.completed) return;
    
    setLoadingTaskIds(prev => new Set(prev).add(task.id));
    
    try {
      const subtaskTitles = await breakDownTask(task.title);
      
      const newSubtasks: SubTask[] = subtaskTitles.map((title, idx) => ({
        id: `${task.id}_sub_${idx}`,
        title,
        completed: false
      }));

      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, subtasks: newSubtasks } : t
      ));
    } catch (error) {
      console.error("Failed to breakdown task", error);
    } finally {
      setLoadingTaskIds(prev => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subtasks: t.subtasks?.map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        )
      };
    }));
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <IconListTodo className="text-primary-600 w-5 h-5" />
          Görevlerim
        </h2>
        <form onSubmit={addTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Yeni görev ekle..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <IconPlus className="w-6 h-6" />
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-20 md:pb-0">
        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>Henüz görev yok. Güne başlamak için bir tane ekle!</p>
          </div>
        )}
        
        {tasks.map(task => (
          <div key={task.id} className={`bg-white p-4 rounded-lg shadow-sm border transition-all ${task.completed ? 'border-gray-100 opacity-60' : 'border-gray-200 hover:border-primary-200'}`}>
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleTask(task.id)}
                className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-primary-500'
                }`}
              >
                {task.completed && <IconCheck className="w-3.5 h-3.5" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium break-words ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {task.title}
                </p>
                
                {/* AI Suggestion Button */}
                {!task.completed && (!task.subtasks || task.subtasks.length === 0) && (
                  <button
                    onClick={() => handleMagicBreakdown(task)}
                    disabled={loadingTaskIds.has(task.id)}
                    className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-md w-fit transition-colors"
                  >
                    {loadingTaskIds.has(task.id) ? (
                      <IconLoader className="w-3 h-3" />
                    ) : (
                      <IconWand className="w-3 h-3" />
                    )}
                    {loadingTaskIds.has(task.id) ? 'Bölünüyor...' : 'AI ile adımlara böl'}
                  </button>
                )}

                {/* Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="mt-3 space-y-2 pl-1 border-l-2 border-gray-100">
                    {task.subtasks.map(sub => (
                      <div key={sub.id} className="flex items-center gap-2 pl-2">
                        <button
                          onClick={() => toggleSubtask(task.id, sub.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            sub.completed ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300'
                          }`}
                        >
                          {sub.completed && <IconCheck className="w-3 h-3" />}
                        </button>
                        <span className={`text-xs ${sub.completed ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                          {sub.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};