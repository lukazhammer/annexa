import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export function RadarChartControls({
    axes,
    differentiators = [],
    isUpdating,
    onDifferentiatorAdd,
    onDifferentiatorRemove
}) {
    const [newDifferentiator, setNewDifferentiator] = useState('');

    const handleAdd = async () => {
        if (!newDifferentiator.trim() || isUpdating) return;

        await onDifferentiatorAdd(newDifferentiator.trim());
        setNewDifferentiator('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isUpdating) {
            handleAdd();
        }
    };

    return (
        <div className="border-2 border-zinc-800 rounded-lg p-6">
            <h3 className="font-serif text-xl mb-2">Define Your Differentiators</h3>
            <p className="text-zinc-400 text-sm mb-4">
                Add features or positioning points that set you apart. The chart updates to reflect your unique strengths.
            </p>

            {/* Input row */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newDifferentiator}
                    onChange={(e) => setNewDifferentiator(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., 'We focus on simplicity and speed'"
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:border-[#C24516] focus:outline-none disabled:opacity-50 text-zinc-100 placeholder:text-zinc-600"
                />
                <Button
                    onClick={handleAdd}
                    disabled={!newDifferentiator.trim() || isUpdating}
                    className="px-4 py-2 bg-[#C24516] text-white rounded-lg hover:bg-[#A03814] transition-colors disabled:opacity-50"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                </Button>
            </div>

            {/* Differentiator tags */}
            {differentiators.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Your Differentiators:</p>
                    <div className="flex flex-wrap gap-2">
                        {differentiators.map((diff, i) => (
                            <div
                                key={i}
                                className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-full text-sm flex items-center gap-2 group"
                            >
                                <span className="text-zinc-200">{diff}</span>
                                <button
                                    onClick={() => onDifferentiatorRemove(i)}
                                    disabled={isUpdating}
                                    className="text-zinc-500 hover:text-zinc-300 disabled:opacity-50 transition-colors"
                                    aria-label="Remove differentiator"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {differentiators.length === 0 && (
                <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                    <p className="text-xs text-zinc-500 mb-2">Suggestions based on detected dimensions:</p>
                    <div className="flex flex-wrap gap-2">
                        {axes.slice(0, 3).map((axis) => (
                            <button
                                key={axis.id}
                                onClick={() => setNewDifferentiator(`Strong ${axis.name.toLowerCase()}`)}
                                className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                                + {axis.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default RadarChartControls;
