
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

const HeroBannerGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateHeroImage = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-hero-image', {
        body: {}
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast.error('Failed to generate image');
        return;
      }

      if (data.success && data.image) {
        const imageDataUrl = `data:image/webp;base64,${data.image}`;
        setGeneratedImage(imageDataUrl);
        toast.success('Hero banner generated successfully!');
      } else {
        toast.error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating hero image:', error);
      toast.error('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'offroad-spare-hub-hero-banner.webp';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Hero Banner Generator
        </h2>
        <p className="text-muted-foreground">
          Generate a custom hero banner image for OffroadSpareHub
        </p>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={generateHeroImage}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Hero Banner...
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 mr-2" />
              Generate Hero Banner
            </>
          )}
        </Button>

        {generatedImage && (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <img 
                src={generatedImage} 
                alt="Generated OffroadSpareHub Hero Banner"
                className="w-full h-auto"
              />
            </div>
            
            <Button 
              onClick={downloadImage}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Hero Banner
            </Button>
            
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <p className="font-medium mb-1">Usage Instructions:</p>
              <p>1. Download the generated image</p>
              <p>2. Save it to your project's public/images folder</p>
              <p>3. Update your homepage to use the new hero banner</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroBannerGenerator;
