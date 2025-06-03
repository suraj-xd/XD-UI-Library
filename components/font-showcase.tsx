import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FontShowcase() {
  return (
    <div className="grid gap-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Font Showcase</h1>
        <p className="text-muted-foreground">All available fonts in your project</p>
      </div>

      {/* Satoshi Font */}
      <Card>
        <CardHeader>
          <CardTitle>Satoshi (font-sans)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="font-sans font-light text-sm">Light (300): The quick brown fox jumps over the lazy dog</div>
          <div className="font-sans font-light italic text-sm">Light Italic (300): The quick brown fox jumps over the lazy dog</div>
          <div className="font-sans font-normal text-base">Regular (400): The quick brown fox jumps over the lazy dog</div>
          <div className="font-sans font-normal italic text-base">Regular Italic (400): The quick brown fox jumps over the lazy dog</div>
          <div className="font-sans font-medium text-lg">Medium (500): The quick brown fox jumps over the lazy dog</div>
          <div className="font-sans font-medium italic text-lg">Medium Italic (500): The quick brown fox jumps over the lazy dog</div>
          <div className="font-sans font-bold text-xl">Bold (700): The quick brown fox jumps over the lazy dog</div>
          <div className="font-sans font-bold italic text-xl">Bold Italic (700): The quick brown fox jumps over the lazy dog</div>
          <div className="font-sans font-black text-2xl">Black (900): The quick brown fox jumps over the lazy dog</div>
          <div className="font-sans font-black italic text-2xl">Black Italic (900): The quick brown fox jumps over the lazy dog</div>
        </CardContent>
      </Card>

      {/* Instrument Serif Font */}
      <Card>
        <CardHeader>
          <CardTitle>Instrument Serif (font-serif)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="font-serif text-lg">Regular (400): The quick brown fox jumps over the lazy dog</div>
          <div className="font-serif text-2xl">Large: Typography with elegant serifs</div>
        </CardContent>
      </Card>

      {/* PP Neue Bit Font */}
      <Card>
        <CardHeader>
          <CardTitle>PP Neue Bit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div style={{ fontFamily: 'var(--font-pp-neue-bit)' }} className="font-bold text-lg">
            Bold (700): MODERN DIGITAL TYPEFACE
          </div>
          <div style={{ fontFamily: 'var(--font-pp-neue-bit)' }} className="font-bold text-3xl">
            LARGE HEADING STYLE
          </div>
          <p className="text-sm text-muted-foreground">
            Perfect for headlines, logos, and digital-first designs
          </p>
        </CardContent>
      </Card>

      {/* PP Right Serif Font */}
      <Card>
        <CardHeader>
          <CardTitle>PP Right Serif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div style={{ fontFamily: 'var(--font-pp-right-serif)' }} className="text-sm font-light">
            Light (300): Elegant serif with multiple variations
          </div>
          <div style={{ fontFamily: 'var(--font-pp-right-serif)' }} className="text-base font-normal">
            Regular (400): Beautiful editorial typography
          </div>
          <div style={{ fontFamily: 'var(--font-pp-right-serif)' }} className="text-lg font-medium">
            Medium (500): Perfect for body text and articles
          </div>
          <div style={{ fontFamily: 'var(--font-pp-right-serif)' }} className="text-xl font-semibold">
            Semibold (600): Great for subheadings
          </div>
          <div style={{ fontFamily: 'var(--font-pp-right-serif)' }} className="text-2xl font-bold">
            Bold (700): Strong impact headlines
          </div>
          <div style={{ fontFamily: 'var(--font-pp-right-serif)' }} className="text-3xl font-black">
            Black (900): Maximum impact
          </div>
          <p className="text-sm text-muted-foreground">
            Includes variations: Wide, Tall, Tight, Narrow, Spatial, Compact styles
          </p>
        </CardContent>
      </Card>

      {/* PP Mondwest Font */}
      <Card>
        <CardHeader>
          <CardTitle>PP Mondwest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div style={{ fontFamily: 'var(--font-pp-mondwest)' }} className="text-lg font-normal">
            Regular (400): Distinctive display typeface
          </div>
          <div style={{ fontFamily: 'var(--font-pp-mondwest)' }} className="text-3xl font-normal">
            PERFECT FOR BRANDING
          </div>
          <p className="text-sm text-muted-foreground">
            Ideal for logos, headers, and distinctive design elements
          </p>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Usage in Tailwind CSS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Pre-configured classes:</h4>
            <code className="text-sm block mb-1">font-sans (Satoshi)</code>
            <code className="text-sm block mb-1">font-serif (Instrument Serif)</code>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Custom font styles:</h4>
            <code className="text-sm block mb-1">style=&#123;&#123; fontFamily: 'var(--font-pp-neue-bit)' &#125;&#125;</code>
            <code className="text-sm block mb-1">style=&#123;&#123; fontFamily: 'var(--font-pp-right-serif)' &#125;&#125;</code>
            <code className="text-sm block mb-1">style=&#123;&#123; fontFamily: 'var(--font-pp-mondwest)' &#125;&#125;</code>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Or extend Tailwind config to add custom classes:</h4>
            <pre className="text-xs bg-background p-2 rounded mt-2 overflow-x-auto">
{`fontFamily: {
  'pp-neue-bit': ['var(--font-pp-neue-bit)'],
  'pp-right-serif': ['var(--font-pp-right-serif)'],
  'pp-mondwest': ['var(--font-pp-mondwest)'],
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 