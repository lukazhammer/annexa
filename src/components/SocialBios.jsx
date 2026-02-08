import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

export default function SocialBios({ formData, socialBios }) {
  const [copiedBio, setCopiedBio] = useState(null);

  const truncate = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  // Use AI-generated bios if available, otherwise fall back to template
  const bios = {
    twitter: socialBios?.twitter || truncate(`${formData.company_name || 'Product'} - ${formData.product_description || 'Description'}`, 160),
    linkedin: socialBios?.linkedin || truncate(`${formData.company_name || 'Product'} helps ${(formData.product_description || 'Description').toLowerCase()}.`, 200),
    instagram: socialBios?.instagram || truncate(`${formData.company_name || 'Product'}: ${formData.product_description || 'Description'}`, 150)
  };

  const handleCopy = (bioType, content) => {
    navigator.clipboard.writeText(content);
    setCopiedBio(bioType);
    setTimeout(() => setCopiedBio(null), 2000);
  };

  const bioSections = [
    {
      id: 'twitter',
      label: 'X/Twitter Bio',
      maxChars: 160,
      content: bios.twitter
    },
    {
      id: 'linkedin',
      label: 'LinkedIn About',
      maxChars: 200,
      content: bios.linkedin
    },
    {
      id: 'instagram',
      label: 'Instagram Bio',
      maxChars: 150,
      content: bios.instagram
    }
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Social bios</h2>
        <p className="text-sm text-zinc-400">For X/Twitter, LinkedIn, Product Hunt</p>
      </div>

      <div className="space-y-4">
        {bioSections.map((bio) => (
          <div key={bio.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                {bio.label}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(bio.id, bio.content)}
                className="bg-zinc-900 border-[#C24516] text-[#C24516] hover:bg-[#C24516] hover:text-white h-8"
              >
                {copiedBio === bio.id ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied ✓
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-300 leading-relaxed">{bio.content}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs ${
                  bio.content.length >= bio.maxChars 
                    ? 'text-amber-500' 
                    : 'text-zinc-500'
                }`}>
                  {bio.content.length} characters
                  {bio.content.length >= bio.maxChars && ' (at limit)'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}