
import React from 'react';
import { Feature } from '../types';

interface FeatureCardProps {
  feature: Feature;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, isActive, isCompleted, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition-all border ${
        isActive 
          ? 'bg-indigo-50 border-indigo-200 shadow-md ring-1 ring-indigo-500' 
          : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>{feature}</h3>
        {isCompleted && (
          <span className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>
    </button>
  );
};

export default FeatureCard;
