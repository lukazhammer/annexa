import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, RotateCcw } from 'lucide-react';

export default function DraftModal({ open, onContinue, onStartFresh, lastSaved }) {
  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome back!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-zinc-300">You have a draft in progress.</p>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Clock className="w-4 h-4" />
              <span>Last saved {formatTimeAgo(lastSaved)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onContinue}
              className="w-full bg-[#C24516] hover:bg-[#a33912] text-white h-12"
            >
              Continue where I left off
            </Button>
            <Button
              onClick={onStartFresh}
              className="w-full bg-white text-[#09090B] hover:bg-[#faf7f2] h-12"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Start fresh
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}