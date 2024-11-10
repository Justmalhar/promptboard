'use client';

import { Dialog } from './ui/dialog';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface CardProps {
  id: string;
  title: string;
  prompt: string;
  status: 'todo' | 'inProgress' | 'done';
  onStatusChange: (id: string, status: 'todo' | 'inProgress' | 'done') => void;
}

const systemPromptTemplate = `Create a well-structured markdown document following these guidelines:

1. Use appropriate heading levels (# for main title, ## for sections, ### for subsections)
2. Include bullet points or numbered lists where relevant
3. Utilize **bold** and *italic* text for emphasis
4. Add code blocks with proper language syntax highlighting where applicable
5. Include relevant links or references if needed
6. Use blockquotes for important notes or quotes
7. Add horizontal rules (---) to separate major sections
8. Include tables if data presentation is needed

Here's your prompt to transform into markdown:

`;

export const Card = ({ id, title, prompt, status, onStatusChange }: CardProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleDownload = () => {
    const fullPrompt = systemPromptTemplate + prompt;
    const blob = new Blob([fullPrompt], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{prompt}</p>
        <div className="flex justify-between items-center">
          <select
            value={status}
            onChange={(e) => onStatusChange(id, e.target.value as 'todo' | 'inProgress' | 'done')}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="todo">Todo</option>
            <option value="inProgress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <div className="space-x-2">
            <button
              onClick={handlePreview}
              className="bg-[#1877F2] text-white px-3 py-1 rounded text-sm hover:bg-[#1664D9]"
            >
              Preview
            </button>
            <button
              onClick={handleDownload}
              className="bg-[#1877F2] text-white px-3 py-1 rounded text-sm hover:bg-[#1664D9]"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="prose max-w-none">
              <ReactMarkdown>{systemPromptTemplate + prompt}</ReactMarkdown>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};
