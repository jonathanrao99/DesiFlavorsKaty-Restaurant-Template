'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { Button } from '@heroui/react';
import { Confetti } from '@/components/magicui/confetti';
import { motion } from 'framer-motion';
import Link from 'next/link';

const ADMIN_CODE = '366736';

export default function NimdaAuthPage() {
  const [code, setCode] = useState('');
  const [tries, setTries] = useState(0);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotName, setForgotName] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const router = useRouter();
  const lockoutRef = useRef(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const getMaskedCode = () => '*'.repeat(code.length).padEnd(6, '');

  async function fetchClientInfo() {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        org: data.org,
        userAgent: navigator.userAgent,
        time: new Date().toLocaleString(),
      };
    } catch {
      return { ip: 'unknown', city: '', region: '', country: '', org: '', userAgent: navigator.userAgent, time: new Date().toLocaleString() };
    }
  }

  const handleOTPChange = async (val: string) => {
    setCode(val);
    if (val.length === 6) {
      if (val === ADMIN_CODE) {
        setShowConfetti(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nimda_authed', 'true');
        }
        setTimeout(() => {
          router.push('/nimda/dashboard');
        }, 1500);
      } else {
        const nextTries = tries + 1;
        setTries(nextTries);
        if (nextTries < 3) {
          setError(`Incorrect passcode. ${3 - nextTries} attempt(s) left.`);
          setCode('');
        } else {
          setLocked(true);
          setError('Too many failed attempts. Access temporarily locked.');
          if (!lockoutRef.current) {
            lockoutRef.current = true;
            const info = await fetchClientInfo();
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: 'desiflavorskaty@gmail.com',
                subject: 'Admin Login Lockout Alert',
                html: `
                  <h2>Multiple Invalid Admin Logins</h2>
                  <p><b>Time:</b> ${info.time}</p>
                  <p><b>IP:</b> ${info.ip}</p>
                  <p><b>Location:</b> ${info.city}, ${info.region}, ${info.country}</p>
                  <p><b>ISP/Org:</b> ${info.org}</p>
                  <p><b>User Agent:</b> ${info.userAgent}</p>
                  <p style='color:red'><b>Action Required:</b> Please review recent login attempts.</p>`,
                text: `Login alert\nTime: ${info.time}\nIP: ${info.ip}\nUser Agent: ${info.userAgent}`,
              }),
            });
          }
        }
      }
    }
  };

  const handleForgot = async () => {
    setIsSending(true);
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'desiflavorskaty@gmail.com',
        subject: 'Admin Passcode Reset Request',
        html: `<p><b>Name:</b> ${forgotName}<br/><b>Phone:</b> ${forgotPhone}</p>`,
        text: `Name: ${forgotName}\nPhone: ${forgotPhone}`,
      }),
    });
    setIsSending(false);
    setForgotSent(true);
    setTimeout(() => {
      setShowForgot(false);
      setForgotSent(false);
      setForgotName('');
      setForgotPhone('');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-desi-cream">
      <header className="shadow-none transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-samarkan text-3xl text-desi-orange">Desi</span>
            <span className="font-display text-2xl font-bold tracking-wide text-desi-black">Flavors Katy</span>
          </Link>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4">
        <main
          className="relative bg-white border border-gray-100 px-8 py-12 rounded-3xl shadow-lg overflow-hidden w-full max-w-md flex flex-col gap-8 items-center animate-fade-in transition-all duration-300 hover:shadow-xl"
        >
          {showConfetti && (
            <Confetti
              className="absolute inset-0 pointer-events-none -z-10 w-full h-full"
              options={{
                particleCount: 250,
                spread: 360,
                startVelocity: 40,
                gravity: 0.35,
                origin: { x: 0.5, y: 0.2 },
                ticks: 300,
              }}
            />
          )}
          <h2 className="text-2xl font-display font-bold text-center text-desi-orange">Admin Login</h2>

          <InputOTP
            maxLength={6}
            type="password"
            value={code}
            onChange={handleOTPChange}
            containerClassName="flex justify-center space-x-4"
            className="w-14 h-14 text-center border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-desi-orange focus:ring-1 focus:ring-desi-orange"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <div className="text-sm text-red-500 text-center transition-opacity duration-300 ease-in-out">{error}</div>
          )}

          <button
            className="text-xs text-desi-orange underline mt-2 transition-all duration-200 hover:opacity-80"
            onClick={() => setShowForgot(true)}
            disabled={locked}
          >
            Forgot passcode?
          </button>
        </main>

        {/* Modal */}
        {showForgot && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 transition-opacity">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-up transition-all duration-300">
              <h3 className="text-lg font-semibold mb-3">Request Passcode</h3>
              <input
                placeholder="Your Name"
                value={forgotName}
                onChange={e => setForgotName(e.target.value)}
                className="mb-3 border border-gray-300 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-desi-orange outline-none transition-all"
                disabled={locked}
              />
              <input
                type="tel"
                inputMode="tel"
                placeholder="Your Phone Number"
                value={forgotPhone}
                onChange={e => setForgotPhone(e.target.value)}
                className="mb-4 border border-gray-300 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-desi-orange outline-none transition-all"
                disabled={locked}
              />
              <Button
                onClick={handleForgot}
                disabled={!forgotName || !forgotPhone || forgotSent || locked || isSending}
                className={`w-full rounded-full text-white bg-desi-orange hover:bg-desi-orange/90 transition ${isSending ? 'opacity-60 pointer-events-none' : ''}`}
              >
                {isSending ? 'Sending...' : forgotSent ? 'Request Sent' : 'Send Request'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowForgot(false);
                  setForgotSent(false);
                  setForgotName('');
                  setForgotPhone('');
                }}
                className="w-full mt-2 rounded-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
