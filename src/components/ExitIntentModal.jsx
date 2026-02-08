import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, X } from 'lucide-react';

export default function ExitIntentModal({ open, onOpenChange, formData, progressPercentage, onSave }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSave = async () => {
    if (!email) return;
    
    setSending(true);
    try {
      await onSave(email);
      sessionStorage.setItem('exitIntentDismissed', 'true');
      onOpenChange(false);
    } catch (err) {
      alert('Failed to save progress. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('exitIntentDismissed', 'true');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDismiss}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#C24516] focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4 text-zinc-400" />
          <span className="sr-only">Close</span>
        </button>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Almost done!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <p className="text-zinc-300 text-lg mb-2">
              Your kit is <span className="text-[#C24516] font-bold">{progressPercentage}%</span> complete
            </p>
            <p className="text-zinc-400 text-sm">
              Save your progress and finish later?
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && email) {
                  handleSave();
                }
              }}
            />

            <div className="space-y-2">
              <Button
                onClick={handleSave}
                disabled={sending || !email}
                className="w-full bg-[#C24516] hover:bg-[#a33912] text-white h-12"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Email me a link to finish later
                  </>
                )}
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="w-full text-zinc-400 hover:text-white"
              >
                No thanks, keep going
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}