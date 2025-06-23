
import React from 'react';
import HeroBannerGenerator from '../components/HeroBannerGenerator';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const GenerateHeroPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
        
        <HeroBannerGenerator />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            This tool generates AI-powered hero banner images for your OffroadSpareHub website.
            <br />
            Make sure to set your OpenAI API key in Supabase secrets.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GenerateHeroPage;
