"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

export function SubmitReviewTrigger({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button
        type="button"
        className={cn("rounded-full px-5 shadow-sm", className)}
        onClick={() => setOpen(true)}
      >
        Add review
      </Button>
      <SubmitReviewDialogContent
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          setOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

function SubmitReviewDialogContent({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [authorName, setAuthorName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [quote, setQuote] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [rating, setRating] = useState(5);
  const [trapWebsite, setTrapWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/public/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName,
          role,
          company,
          quote,
          avatarUrl,
          rating,
          trapWebsite,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      onSuccess();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[min(90vh,720px)] gap-0 overflow-y-auto p-0 sm:max-w-lg"
      >
        <DialogHeader className="border-b border-border px-4 py-4 text-left sm:px-6">
          <DialogTitle>Submit a review</DialogTitle>
          <DialogDescription>
            Your testimonial is sent to the site owner for approval before it
            appears publicly.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4 px-4 py-4 sm:px-6"
          onSubmit={(e) => void submit(e)}
        >
          <input
            type="text"
            name="trapWebsite"
            value={trapWebsite}
            onChange={(e) => setTrapWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
            aria-hidden
          />
          <div className="space-y-2">
            <Label htmlFor="review-author">Your name</Label>
            <Input
              id="review-author"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              maxLength={120}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="review-role">Role (optional)</Label>
              <Input
                id="review-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-company">Company (optional)</Label>
              <Input
                id="review-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                maxLength={120}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-rating">Rating (optional)</Label>
            <select
              id="review-rating"
              className={selectClass}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              <option value={5}>5 stars</option>
              <option value={4}>4 stars</option>
              <option value={3}>3 stars</option>
              <option value={2}>2 stars</option>
              <option value={1}>1 star</option>
              <option value={0}>No stars</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-quote">Your review</Label>
            <Textarea
              id="review-quote"
              className="min-h-[120px] resize-y"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              required
              minLength={10}
              maxLength={2000}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-avatar">Avatar image URL (optional)</Label>
            <Input
              id="review-avatar"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/40 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Submit for approval"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
