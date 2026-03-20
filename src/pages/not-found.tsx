import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in">
      <div className="text-9xl font-black font-display text-muted-foreground/20 mb-4">404</div>
      <h2 className="text-2xl font-bold mb-2">Game Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">Looks like this page got lost in the shuffle. Let's get you back to the casino floor.</p>
      <Link href="/">
        <Button size="lg">Back to Lobby</Button>
      </Link>
    </div>
  );
}
