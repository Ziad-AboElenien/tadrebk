'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toastHelper } from '@/lib/toast';

export default function ContactForm() {
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [message, setMessage] = useState('');
const [errors, setErrors] = useState<Record<string, string>>({});
const [sending, setSending] = useState(false);

async function handleSubmit(e: React.FormEvent) {
e.preventDefault();
const errs: Record<string, string> = {};
if (!name.trim()) errs.name = 'Please enter your name.';
if (!email.trim()) errs.email = 'Please enter your email.';
else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email address.';
if (!message.trim()) errs.message = 'Please write your message.';
setErrors(errs);
if (Object.keys(errs).length > 0) return;
setSending(true);
// No backend endpoint yet — simulate a successful send for now.
await new Promise((resolve) => setTimeout(resolve, 600));
setSending(false);
setName('');
setEmail('');
setMessage('');
setErrors({});
toastHelper.success('Message sent! We will get back to you within 24 hours.');
}

  return (
<div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-5 sm:p-8 md:p-12 max-w-2xl mx-auto">
<h2 className="text-3xl font-bold text-slate-900 mb-2">Send us a message</h2>
<p className="text-slate-400 text-sm mb-8">
Fill in the form below and we will reply to your email.
</p>
<form onSubmit={handleSubmit} className="space-y-5" noValidate>
<Input
label="Your name"
value={name}
onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
placeholder="John Doe"
error={errors.name}
/>
<Input
label="Email address"
type="email"
value={email}
onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
placeholder="you@example.com"
error={errors.email}
/>
<div className="flex flex-col gap-1.5">
<label htmlFor="contact-message" className="text-sm font-semibold text-slate-700">
Message
</label>
<textarea
id="contact-message"
value={message}
onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: '' })); }}
placeholder="How can we help you?"
rows={5}
className={`w-full border rounded-xl bg-white text-slate-800 placeholder:text-slate-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 hover:border-slate-300 transition-all duration-200 ${errors.message ? 'border-rose-400' : 'border-slate-200'}`}
/>
{errors.message && <p className="text-xs font-medium text-rose-500">{errors.message}</p>}
</div>
        <Button type="submit" loading={sending} fullWidth>
          Send Message
        </Button>
      </form>
    </div>
  );
}
