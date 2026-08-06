'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toastHelper } from '@/lib/toast';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toastHelper.error('Please fill in all fields.');
      return;
    }
    setSending(true);
    // No backend endpoint yet — simulate a successful send for now.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSending(false);
    setName('');
    setEmail('');
    setMessage('');
    toastHelper.success('Message sent! We will get back to you within 24 hours.');
  }

  return (
    <div className="bg-white rounded-[32px] border border-gray-50 shadow-sm p-8 md:p-12 max-w-2xl mx-auto">
      <h2 className="text-3xl font-black text-[#1a2e35] mb-2">Send us a message</h2>
      <p className="text-gray-400 text-sm mb-8">
        Fill in the form below and we will reply to your email.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
        />
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-message" className="text-sm font-semibold text-gray-700">
            Message
          </label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help you?"
            rows={5}
            className="w-full border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-gray-300 transition-all duration-200"
          />
        </div>
        <Button type="submit" loading={sending} fullWidth>
          Send Message
        </Button>
      </form>
    </div>
  );
}
