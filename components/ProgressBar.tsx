
import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
