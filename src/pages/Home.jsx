import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowDown, ScanLine, FileText, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setError('');
    setScanning(true);

    try {
      const response = await base44.functions.invoke('scanWebsite', { url });
      
      navigate('/form', { 
        state: { 
          scanResults: response.data,
          websiteUrl: url 
        } 
      });
    } catch (err) {
      setError('Unable to scan website. Please try manual entry.');
      setScanning(false);
    }
  };

  const handleManual = () => {
    navigate('/form');
  };

  if (!mode) {
    return (
      <div className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-[180px] max-w-[900px] mx-auto">
            <h2 className="text-[64px] md:text-[56px] sm:text-[36px] font-bold mb-10 text-[#faf7f2] leading-tight">
              Legal foundation. Built in 5 minutes.
            </h2>
            <p className="text-[20px] md:text-xl sm:text-lg text-[rgba(250,247,242,0.8)] leading-relaxed">
              Privacy Policy, Terms, Cookie Policy, and support docs for your SaaS. GDPR and CCPA ready.
            </p>
          </div>

          {/* What You'll Get Section */}
          <div className="mb-[140px] md:mb-[140px] sm:mb-[100px] max-w-[700px] mx-auto">
          <h3 className="text-[32px] md:text-[28px] sm:text-[24px] font-bold mb-10 text-[#faf7f2]">
            What you'll get
          </h3>
          
          {/* Legal Foundation */}
          <div className="mb-8">
            <p className="text-[13px] font-semibold text-[rgba(250,247,242,0.5)] mb-4 uppercase tracking-wider">Legal Foundation</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#faf7f2] text-lg">
                <Check className="w-5 h-5 text-[#C24516] flex-shrink-0" />
                <span>Privacy Policy <span className="text-[rgba(250,247,242,0.5)] text-base">(GDPR + CCPA)</span></span>
              </div>
              <div className="flex items-center gap-3 text-[#faf7f2] text-lg">
                <Check className="w-5 h-5 text-[#C24516] flex-shrink-0" />
                <span>Terms of Service</span>
              </div>
              <div className="flex items-center gap-3 text-[#faf7f2] text-lg">
                <Check className="w-5 h-5 text-[#C24516] flex-shrink-0" />
                <span>Cookie Policy</span>
              </div>
              <div className="flex items-center gap-3 text-[#faf7f2] text-lg">
                <Check className="w-5 h-5 text-[#C24516] flex-shrink-0" />
                <span>About Us Page</span>
              </div>
            </div>
          </div>

          {/* Search & AI Visibility */}
          <div className="pt-8 border-t border-[rgba(250,247,242,0.1)]">
            <p className="text-[13px] font-semibold text-[rgba(250,247,242,0.5)] mb-4 uppercase tracking-wider">Search & AI Visibility</p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 text-[rgba(250,247,242,0.7)]">
                <Check className="w-4 h-4 text-[#C24516] flex-shrink-0 mt-0.5" />
                <div className="text-base">
                  <span className="text-[#faf7f2]">robots.txt</span>
                  <span className="text-[rgba(250,247,242,0.5)]"> — Search engine instructions</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-[rgba(250,247,242,0.7)]">
                <Check className="w-4 h-4 text-[#C24516] flex-shrink-0 mt-0.5" />
                <div className="text-base">
                  <span className="text-[#faf7f2]">llms.txt</span>
                  <span className="text-[rgba(250,247,242,0.5)]"> — AI assistant guidelines</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-[rgba(250,247,242,0.7)]">
                <Check className="w-4 h-4 text-[#C24516] flex-shrink-0 mt-0.5" />
                <div className="text-base">
                  <span className="text-[#faf7f2]">sitemap.xml</span>
                  <span className="text-[rgba(250,247,242,0.5)]"> — Site structure for indexing</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-[rgba(250,247,242,0.7)]">
                <Check className="w-4 h-4 text-[#C24516] flex-shrink-0 mt-0.5" />
                <div className="text-base">
                  <span className="text-[#faf7f2]">Brand JSON-LD</span>
                  <span className="text-[rgba(250,247,242,0.5)]"> — Rich search results</span>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Path Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-[180px] md:mb-[180px] sm:mb-[130px] max-w-[1000px] mx-auto">
          {/* Primary: Start from Scratch */}
          <button
            onClick={handleManual}
            className="group bg-[#2a2a2c] border border-[rgba(194,69,22,0.2)] rounded-lg p-8 text-left hover:border-[#C24516] hover:scale-[1.02] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#C24516] focus:ring-offset-2 focus:ring-offset-[#09090B] flex flex-col h-full min-h-[280px]"
          >
            <FileText className="w-8 h-8 text-[#C24516] mb-4" />
            <h3 className="text-2xl md:text-2xl sm:text-xl font-bold mb-3 text-[#faf7f2]">Start from Scratch</h3>
            <p className="text-[rgba(250,247,242,0.7)] mb-6 flex-grow leading-relaxed">
              No site yet? Fill out the form and build documents manually.
            </p>
            <div className="mt-auto">
              <Button 
                className="w-full bg-[#C24516] hover:bg-[#a33912] hover:scale-[1.02] active:scale-[0.98] text-white h-12 transition-all duration-150 ease-out"
                onClick={(e) => {
                  e.stopPropagation();
                  handleManual();
                }}
              >
                Fill out the form <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-150" />
              </Button>
            </div>
          </button>

          {/* Secondary: Scan Existing Site */}
          <button
            onClick={() => setMode('scan')}
            className="group bg-[#242426] border border-[rgba(250,247,242,0.12)] rounded-lg p-8 text-left hover:border-[#C24516] hover:scale-[1.02] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#C24516] focus:ring-offset-2 focus:ring-offset-[#09090B] flex flex-col h-full min-h-[280px]"
          >
            <ScanLine className="w-8 h-8 text-[#C24516] mb-4" />
            <h3 className="text-2xl md:text-2xl sm:text-xl font-bold mb-3 text-[#faf7f2]">Scan Existing Site</h3>
            <p className="text-[rgba(250,247,242,0.7)] mb-6 flex-grow leading-relaxed">
              Already have a site? Scan it and pre-fill everything we detect.
            </p>
            <div className="mt-auto">
              <button
                className="w-full bg-transparent border border-[#C24516] text-[#faf7f2] hover:bg-[#C24516]/10 h-12 rounded-md flex items-center justify-center gap-2 transition-all duration-150 ease-out"
                onClick={() => setMode('scan')}
              >
                Drop your URL <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-150" />
              </button>
            </div>
          </button>
        </div>

          {/* Cross-sell Section */}
          <div className="bg-[#1a1a1c] pt-[80px] pb-[80px] px-8 text-center border-t border-t-[rgba(250,247,242,0.12)]">
            <div className="max-w-[800px] mx-auto">
              <h3 className="text-2xl md:text-2xl sm:text-xl font-semibold mb-6 text-[#faf7f2]">
                Built with Annexa. Now make it distinctive.
              </h3>
              <p className="text-[18px] text-[rgba(250,247,242,0.7)] leading-relaxed mb-6">
                Most SaaS products look identical because AI tools use the same templates. Vox Animus structures your brand intent into enforceable prompts for Bolt, Cursor, and Lovable.
              </p>
              <a 
                href="https://vox-animus.com/demo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#C24516] hover:brightness-110 hover:underline transition-all duration-150"
              >
                See how it works <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'scan') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20">
        <button
          onClick={() => setMode(null)}
          className="text-[rgba(250,247,242,0.7)] hover:text-[#faf7f2] mb-8 flex items-center transition-colors duration-150 focus:outline-none focus:underline"
        >
          ← Back
        </button>

        <h2 className="text-4xl md:text-4xl sm:text-3xl font-bold mb-4 text-[#faf7f2]">Enter your website URL</h2>
        <p className="text-[rgba(250,247,242,0.7)] mb-8 leading-relaxed">
          We'll scan your site to detect existing legal docs, contact info, and services. Everything we find gets pre-filled.
        </p>

        <div className="space-y-6">
          <Input
            type="url"
            placeholder="https://yourwebsite.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-[#242426] border-[rgba(250,247,242,0.12)] text-[#faf7f2] h-14 text-lg focus:ring-2 focus:ring-[#C24516] focus:border-[#C24516] transition-all"
            disabled={scanning}
          />

          {error && (
            <div className="bg-red-950/50 border border-red-800/50 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

          <Button
            onClick={handleScan}
            disabled={scanning}
            className="w-full bg-[#C24516] hover:bg-[#a33912] hover:scale-[1.02] active:scale-[0.98] text-white h-14 px-8 text-lg transition-all duration-150"
          >
            {scanning ? 'Scanning...' : 'Scan Website'}
            {!scanning && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(250,247,242,0.12)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#09090B] text-[rgba(250,247,242,0.5)]">or</span>
            </div>
          </div>

          <Button
            onClick={handleManual}
            variant="outline"
            className="w-full border-[rgba(250,247,242,0.12)] text-[rgba(250,247,242,0.7)] hover:bg-[rgba(250,247,242,0.05)] hover:text-[#faf7f2] h-14 text-base transition-all duration-150"
          >
            Start from scratch instead →
          </Button>

          <div className="bg-[#242426] rounded-lg p-6 mt-8">
            <h3 className="text-base font-semibold text-[#faf7f2] mb-4">What we'll detect</h3>
            <div className="space-y-2 text-sm text-[rgba(250,247,242,0.7)]">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#C24516] flex-shrink-0 mt-0.5" />
                <span>Privacy Policy (if published)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#C24516] flex-shrink-0 mt-0.5" />
                <span>Terms of Service (if published)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#C24516] flex-shrink-0 mt-0.5" />
                <span>Cookie Policy (if published)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#C24516] flex-shrink-0 mt-0.5" />
                <span>Contact information</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#C24516] flex-shrink-0 mt-0.5" />
                <span>Third-party service scripts</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#C24516] flex-shrink-0 mt-0.5" />
                <span>Existing legal entity information</span>
              </div>
            </div>
            <p className="text-sm text-[rgba(250,247,242,0.5)] mt-4">
              We'll pre-fill everything we find. You can edit or add to it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'manual') {
    handleManual();
    return null;
  }
}