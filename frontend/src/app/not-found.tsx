import Link from "next/link";
import { Compass, ArrowLeft, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card variant="elevated" className="max-w-md w-full border-zinc-800 p-8 text-center space-y-4 bg-zinc-950/80">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
          <Compass className="w-6 h-6" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-semibold">404 Error</span>
          <h2 className="text-xl font-bold text-white mt-1">Page Not Found</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            The page or JuryX evaluation resource you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-3 border-t border-zinc-800">
          <Link href="/dashboard">
            <Button variant="primary" size="sm" leftIcon={<Layers className="w-3.5 h-3.5" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
