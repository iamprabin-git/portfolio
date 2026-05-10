"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [trapWebsite, setTrapWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          message,
          trapWebsite,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      toast.success(data.message ?? "Message sent");
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setMessage("");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="h-fit lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle className="font-heading text-lg">
          Enquiry &amp; project request
        </CardTitle>
        <CardDescription>
          General questions or a scoped brief — include timeline and budget if
          you can. I&apos;ll reply by email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => void submit(e)}>
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
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
              autoComplete="email"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone (optional)</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={40}
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-company">Company (optional)</Label>
              <Input
                id="contact-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                maxLength={160}
                autoComplete="organization"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">How can I help?</Label>
            <Textarea
              id="contact-message"
              className="min-h-[140px] resize-y"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
              maxLength={4000}
              placeholder="Project scope, budget range, ideal start date…"
            />
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
            {pending ? "Sending…" : "Submit enquiry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
