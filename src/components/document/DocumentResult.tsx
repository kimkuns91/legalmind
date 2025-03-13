import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentResultProps {
  documentName: string;
  downloadUrl: string;
  params: Record<string, string>;
  className?: string;
}
export function DocumentResult({
  documentName,
  downloadUrl,
  params,
  className,
}: DocumentResultProps) {
  return (
    <Card className={cn('w-full space-y-4 p-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-lg font-semibold">{documentName}</h3>
        <Button
          asChild
          variant="outline"
          className="bg-background hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
        >
          <a
            href={downloadUrl}
            target="blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            문서 다운로드
          </a>
        </Button>
      </div>
      <div className="border-border border-t pt-4">
        <h4 className="text-muted-foreground mb-2 text-sm font-medium">입력된 정보</h4>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          {Object.entries(params).map(([key, value]) => (
            <div key={key} className="flex flex-col space-y-1">
              <dt className="text-muted-foreground text-sm">{key}</dt>
              <dd className="text-foreground text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}
