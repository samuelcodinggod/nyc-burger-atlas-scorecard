import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import burgersJson from '@/data/burgers.json';
import { ExternalLink } from 'lucide-react';

export function AboutSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const meta = (burgersJson as any).metadata;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto scroll-thin">
        <SheetHeader>
          <SheetTitle>About this atlas</SheetTitle>
          <SheetDescription>
            {meta.title}. Last updated {meta.last_updated}.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-5 space-y-4 text-[13.5px] leading-relaxed">
          <p>{meta.methodology}</p>
          <div className="space-y-2">
            <h3 className="font-bold text-[12px] tracking-[0.18em] uppercase text-muted-foreground">
              Editorial sources
            </h3>
            <ul className="space-y-1.5">
              {meta.data_sources.map((s: { name: string; url: string; updated?: string }) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="size-3 shrink-0" />
                    <span>
                      {s.name}
                      {s.updated && (
                        <span className="text-muted-foreground"> · {s.updated}</span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-[11.5px] text-muted-foreground border-t border-border pt-3">
            Group scorecard data lives in your browser session only. Use the copy or download
            buttons on the rankings tab to save results before refreshing the page.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
