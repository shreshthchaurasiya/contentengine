'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsLoading(true);
    setStatusText('Initiating connection to AI Brain...');

    try {
      // Direct call to Backend BIE API
      const response = await fetch('http://localhost:8000/api/v1/bie/analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        // Fallback for MVP if Business ID constraint fails
        console.warn('Backend rejected direct call. Proceeding to Dashboard.');
      } else {
        const data = await response.json();
        console.log('Scrape Task Started:', data);
        setStatusText('Scraping successful!');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to connect to backend', error);
      setStatusText('Connection failed. Proceeding...');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 lg:p-24 animate-fade-in">
      <div className="z-10 w-full max-w-xl items-center justify-center text-sm flex flex-col gap-8">
        
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-white">
            AdsShree <span className="gradient-text">AI</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Generate 30-day marketing campaigns, stunning images, and viral videos in seconds.
          </p>
        </div>

        <div className="glass-panel w-full rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          
          <h2 className="text-2xl font-semibold text-white mb-2">Connect Your Business</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your website URL. Our Business Intelligence Engine will scan it to build your AI Brain.
          </p>

          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">
                Website URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourbrand.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {statusText}
                </>
              ) : (
                'Build AI Brain & Start'
              )}
            </button>
          </form>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          System Online
        </div>
      </div>
    </main>
  );
}
