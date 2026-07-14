import { SearchX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <SearchX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
        </div>
      </CardContent>
    </Card>
  );
}
