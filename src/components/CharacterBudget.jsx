import React from 'react';

export default function CharacterBudget({ value, min = 50, ideal = 150 }) {
  const length = value?.length || 0;
  
  const getStatus = () => {
    if (length === 0) return { message: '', color: 'bg-zinc-700', text: 'text-zinc-500' };
    if (length < 21) return { message: 'Give us a bit more to work with', color: 'bg-red-500', text: 'text-red-400' };
    if (length < min) return { message: 'Almost there', color: 'bg-yellow-500', text: 'text-yellow-400' };
    if (length <= ideal) return { message: 'Perfect length', color: 'bg-green-500', text: 'text-green-400' };
    return { message: 'Can you tighten this up?', color: 'bg-yellow-500', text: 'text-yellow-400' };
  };

  const status = getStatus();
  const progress = Math.min((length / ideal) * 100, 100);

  if (length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${status.color} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs ${status.text} font-medium`}>
          {status.message}
        </span>
        <span className="text-xs text-zinc-500">
          {length} characters
        </span>
      </div>
    </div>
  );
}