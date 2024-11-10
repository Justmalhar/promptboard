'use client';

import { useState } from 'react';
import { Card } from './Card';
import { Lane } from './Lane';
import { PromptForm } from './PromptForm';

interface Prompt {
  id: string;
  title: string;
  prompt: string;
  status: 'todo' | 'inProgress' | 'done';
}

export const Board = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  const handleNewPrompt = (title: string, prompt: string) => {
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      title,
      prompt,
      status: 'todo',
    };
    setPrompts([...prompts, newPrompt]);
  };

  const handleStatusChange = (id: string, newStatus: 'todo' | 'inProgress' | 'done') => {
    setPrompts(prompts.map(prompt => 
      prompt.id === id ? { ...prompt, status: newStatus } : prompt
    ));
  };

  const filterPromptsByStatus = (status: 'todo' | 'inProgress' | 'done') => {
    return prompts.filter(prompt => prompt.status === status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PromptForm onSubmit={handleNewPrompt} />
      <div className="flex gap-4 overflow-x-auto pb-4">
        <Lane title="Todo">
          {filterPromptsByStatus('todo').map(prompt => (
            <Card
              key={prompt.id}
              {...prompt}
              onStatusChange={handleStatusChange}
            />
          ))}
        </Lane>
        <Lane title="In Progress">
          {filterPromptsByStatus('inProgress').map(prompt => (
            <Card
              key={prompt.id}
              {...prompt}
              onStatusChange={handleStatusChange}
            />
          ))}
        </Lane>
        <Lane title="Done">
          {filterPromptsByStatus('done').map(prompt => (
            <Card
              key={prompt.id}
              {...prompt}
              onStatusChange={handleStatusChange}
            />
          ))}
        </Lane>
      </div>
    </div>
  );
};
