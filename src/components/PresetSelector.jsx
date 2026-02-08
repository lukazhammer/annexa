import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import ServiceSelector from '@/components/ServiceSelector';

const presets = {
  minimal: {
    name: 'MINIMAL',
    services: 'Stripe',
    cookies: 'none',
    description: 'Payment processing only',
  },
  standard: {
    name: 'STANDARD',
    services: 'Stripe, Google Analytics, Resend',
    cookies: 'analytics',
    description: 'Payments + basic tracking + email',
    recommended: true,
  },
  growth: {
    name: 'GROWTH',
    services: 'Stripe, Google Analytics, Resend, Vercel, Supabase, Meta Pixel',
    cookies: 'marketing',
    description: 'Everything for scale',
  },
  custom: {
    name: 'CUSTOM',
    services: '',
    cookies: 'analytics',
    description: "I'll choose my own",
  },
};

export default function PresetSelector({ preset, onPresetChange, customServices, onCustomServicesChange, customCookies, onCustomCookiesChange }) {
  const handlePresetSelect = (value) => {
    onPresetChange(value);
  };

  return (
    <div className="space-y-4">
      <RadioGroup value={preset} onValueChange={handlePresetSelect}>
        {Object.entries(presets).map(([key, config]) => (
          <div
            key={key}
            className={`relative flex items-start space-x-3 bg-zinc-900 p-4 rounded-lg border transition-colors cursor-pointer min-h-[60px] ${
              preset === key
                ? 'border-[#C24516] bg-zinc-900/80'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <RadioGroupItem
              value={key}
              id={key}
              className="mt-0.5 border-zinc-600 text-[#C24516] min-w-[20px] min-h-[20px]"
            />
            <div className="flex-1 min-h-[44px] flex flex-col justify-center">
              <Label htmlFor={key} className="text-white font-medium cursor-pointer flex items-center gap-2 text-base sm:text-sm">
                {config.name}
                {config.recommended && (
                  <span className="text-xs bg-[#C24516] text-white px-2 py-0.5 rounded">
                    Recommended
                  </span>
                )}
              </Label>
              <p className="text-sm text-zinc-400 mt-1">{config.description}</p>
              {key !== 'custom' && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {config.services.split(', ').map((service) => (
                    <span
                      key={service}
                      className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded"
                    >
                      {service}
                    </span>
                  ))}
                  <span className="text-xs bg-zinc-800/50 text-zinc-500 px-2 py-1 rounded border border-zinc-700">
                    Cookies: {config.cookies === 'none' ? 'None' : config.cookies === 'analytics' ? 'Analytics' : 'All types'}
                  </span>
                </div>
              )}
            </div>
            {preset === key && (
              <Check className="w-5 h-5 text-[#C24516] absolute top-4 right-4" />
            )}
          </div>
        ))}
      </RadioGroup>

      {/* Show custom options when CUSTOM is selected */}
      {preset === 'custom' && (
        <div className="space-y-4 mt-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
          <div>
            <Label className="text-white mb-3 block text-sm">Do you track analytics?</Label>
            <RadioGroup 
              value={customCookies}
              onValueChange={onCustomCookiesChange}
              className="space-y-2"
            >
              <div className={`flex items-start space-x-3 bg-zinc-900 p-3 rounded-lg border transition-colors min-h-[60px] ${
                customCookies === 'none' ? 'border-[#C24516]' : 'border-zinc-800'
              }`}>
                <RadioGroupItem value="none" id="custom-none" className="mt-0.5 border-zinc-600 text-[#C24516] min-w-[20px] min-h-[20px]" />
                <div className="flex-1">
                  <Label htmlFor="custom-none" className="text-white text-sm cursor-pointer block">
                    No tracking
                  </Label>
                  <p className="text-xs text-zinc-400 mt-0.5">Your site doesn't use any tracking or cookies</p>
                </div>
              </div>
              <div className={`flex items-start space-x-3 bg-zinc-900 p-3 rounded-lg border transition-colors min-h-[60px] ${
                customCookies === 'analytics' ? 'border-[#C24516]' : 'border-zinc-800'
              }`}>
                <RadioGroupItem value="analytics" id="custom-analytics" className="mt-0.5 border-zinc-600 text-[#C24516] min-w-[20px] min-h-[20px]" />
                <div className="flex-1">
                  <Label htmlFor="custom-analytics" className="text-white text-sm cursor-pointer block">
                    Analytics only (recommended)
                  </Label>
                  <p className="text-xs text-zinc-400 mt-0.5">Google Analytics, Plausible, or similar tools</p>
                </div>
              </div>
              <div className={`flex items-start space-x-3 bg-zinc-900 p-3 rounded-lg border transition-colors min-h-[60px] ${
                customCookies === 'marketing' ? 'border-[#C24516]' : 'border-zinc-800'
              }`}>
                <RadioGroupItem value="marketing" id="custom-marketing" className="mt-0.5 border-zinc-600 text-[#C24516] min-w-[20px] min-h-[20px]" />
                <div className="flex-1">
                  <Label htmlFor="custom-marketing" className="text-white text-sm cursor-pointer block">
                    Marketing cookies
                  </Label>
                  <p className="text-xs text-zinc-400 mt-0.5">Facebook Pixel, ads, retargeting tools</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white mb-3 block text-sm">What tools does your product use?</Label>
            <ServiceSelector
              value={customServices}
              onChange={onCustomServicesChange}
              cookieLevel={customCookies}
            />
            <p className="text-xs text-zinc-500 mt-2">This helps us be specific in your privacy policy</p>
          </div>
        </div>
      )}
    </div>
  );
}

export { presets };