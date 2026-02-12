
import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, title }) => {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900 my-4 shadow-xl">
      {title && (
        <div className="bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 border-b border-slate-700 flex justify-between items-center">
          <span>{title}</span>
          <div className="flex space-x-1">
             <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          </div>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed text-indigo-300">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
