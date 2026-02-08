import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, X } from 'lucide-react';

const serviceCategories = {
  Analytics: ['Google Analytics', 'Plausible', 'Fathom', 'Mixpanel', 'Amplitude'],
  Payments: ['Stripe', 'PayPal', 'Paddle', 'Lemon Squeezy', 'Gumroad'],
  Email: ['SendGrid', 'Mailchimp', 'Brevo (Sendinblue)', 'Postmark'],
  Hosting: ['Vercel', 'Netlify', 'AWS', 'Railway', 'Render', 'Fly.io'],
  Marketing: ['Facebook Pixel', 'Google Ads', 'LinkedIn Insight', 'Hotjar']
};

export default function ServiceSelector({ value, onChange, cookieLevel }) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [customText, setCustomText] = useState('');

  // Pre-populate based on cookie level
  useEffect(() => {
    if (cookieLevel === 'analytics' && selectedServices.length === 0 && !value) {
      setSelectedServices(['Google Analytics']);
    }
  }, [cookieLevel]);

  // Update parent when services or custom text changes
  useEffect(() => {
    const servicesText = selectedServices.join(', ');
    const combined = [servicesText, customText].filter(Boolean).join(', ');
    onChange(combined);
  }, [selectedServices, customText]);

  const addService = (service) => {
    if (!selectedServices.includes(service)) {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const removeService = (service) => {
    setSelectedServices(selectedServices.filter(s => s !== service));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(serviceCategories).map(([category, services]) => (
          <DropdownMenu key={category}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <Plus className="w-3 h-3 mr-1" />
                {category}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
              {services.map(service => (
                <DropdownMenuItem
                  key={service}
                  onClick={() => addService(service)}
                  className="text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
                >
                  {service}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      {selectedServices.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedServices.map(service => (
            <div
              key={service}
              className="flex items-center gap-2 bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-sm border border-zinc-700"
            >
              {service}
              <button
                type="button"
                onClick={() => removeService(service)}
                className="hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <Label className="text-white mb-2 block text-sm">Or add custom services:</Label>
        <Textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className="bg-zinc-900 border-zinc-800 text-white h-20"
          placeholder="Any other tools not listed above..."
        />
      </div>
    </div>
  );
}