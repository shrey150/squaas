"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");

  const handleWaitlist = (event: React.FormEvent) => {
    event.preventDefault();
    alert("Thanks for your interest! We'll be in touch soon.");
    setEmail("");
  };

  return (
    <main className="min-h-screen bg-[#120c07] text-[#f8e9d7]">
      <section className="px-6 py-20 sm:py-28 md:py-32">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.6em] text-[#ebc88a]/80 sm:text-sm">
            Sidequests as a Service
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#fde4b5] sm:text-5xl md:text-6xl">
            Turn every walk into an adventure.
          </h1>
          <p className="mt-6 max-w-3xl text-base text-[#f1d7ab]/75 sm:text-lg md:text-xl">
            SQUAAS blends realtime GPS, live narration, and dynamic quests so
            every neighborhood feels like a fantasy realm. Grab your phone,
            step outside, and become the hero.
          </p>
          <div className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <a
              href="#features"
              className="w-full rounded-full bg-[#deb878] px-8 py-3 text-center text-sm font-semibold uppercase tracking-wide text-[#271b0f] transition hover:bg-[#f0c98c] sm:w-auto"
            >
              Explore Features
            </a>
            <a
              href="#waitlist"
              className="w-full rounded-full border border-[#deb878]/70 px-8 py-3 text-center text-sm font-semibold uppercase tracking-wide text-[#fde4b5] transition hover:border-[#f0c98c] hover:text-white sm:w-auto"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="px-6 pb-20 sm:px-8 sm:pb-24 md:px-12 md:pb-28"
      >
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-semibold text-[#fde4b5] sm:text-4xl md:text-5xl">
            A HUD that stays readable everywhere
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-[#f1d7ab]/70 sm:text-lg">
            Designed to resize gracefully from mobile screens to ultrawide
            monitors. Every section centers automatically and stretches just
            enough to breathe.
          </p>

          <div className="mt-14 grid gap-8 text-left sm:grid-cols-2 lg:grid-cols-4">
            <article className="flex h-full flex-col rounded-3xl border border-[#3e2a1c] bg-[#1b120b]/70 p-7 backdrop-blur">
              <h3 className="text-lg font-semibold text-[#fde4b5]">
                Live map + compass
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#f1d7ab]/70">
                Your position, heading, and nearby objectives stay centered so
                you can glance once and keep moving.
              </p>
            </article>
            <article className="flex h-full flex-col rounded-3xl border border-[#3e2a1c] bg-[#1b120b]/70 p-7 backdrop-blur">
              <h3 className="text-lg font-semibold text-[#fde4b5]">
                AI story beats
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#f1d7ab]/70">
                Narration reacts to camera input in real time. Landmarks become
                lore, bystanders turn into characters.
              </p>
            </article>
            <article className="flex h-full flex-col rounded-3xl border border-[#3e2a1c] bg-[#1b120b]/70 p-7 backdrop-blur">
              <h3 className="text-lg font-semibold text-[#fde4b5]">
                Focused quest tracking
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#f1d7ab]/70">
                Boss bars, danger levels, and objectives are anchored to the
                center column so nothing slips out of frame.
              </p>
            </article>
            <article className="flex h-full flex-col rounded-3xl border border-[#3e2a1c] bg-[#1b120b]/70 p-7 backdrop-blur">
              <h3 className="text-lg font-semibold text-[#fde4b5]">
                Stream-ready overlays
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#f1d7ab]/70">
                Toggle layouts for desktop, portrait, and ultrawide streams
                without redesigning your scene.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        id="waitlist"
        className="px-6 pb-24 sm:px-8 sm:pb-28 md:px-12 md:pb-32"
      >
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#3e2a1c] bg-[#1b120b]/75 p-10 text-center shadow-[0_25px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur">
          <h2 className="text-3xl font-semibold text-[#fde4b5] sm:text-4xl">
            Be first to try the demo.
          </h2>
          <p className="mt-4 text-base text-[#f1d7ab]/70 sm:text-lg">
            We’re onboarding a small group of alpha testers to stress the mobile
            HUD, compass smoothing, and livestream integrations.
          </p>
          <form
            onSubmit={handleWaitlist}
            className="mt-8 flex w-full flex-col gap-4 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your.email@realm.com"
              required
              className="w-full flex-1 rounded-full border border-[#3e2a1c]/80 bg-[#120c07] px-5 py-3 text-sm text-[#fde4b5] placeholder:text-[#caa97a]/60 focus:border-[#deb878] focus:outline-none focus:ring-2 focus:ring-[#deb878]/40"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-[#deb878] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#271b0f] transition hover:bg-[#f0c98c] sm:w-auto"
            >
              Join Waitlist
            </button>
          </form>
        </div>
      </section>

      <footer className="px-6 pb-16 text-center text-sm text-[#caa97a]/70 sm:px-8 md:px-12">
        <div className="mx-auto max-w-6xl border-t border-[#3e2a1c]/70 pt-10">
          <p>SQUAAS • Crafted in 2025 for IRL adventurers</p>
          <div className="mt-4 flex justify-center gap-6 text-[#f1d7ab]/60">
            <a href="#" className="transition hover:text-[#fde4b5]">
              Twitter
            </a>
            <a href="#" className="transition hover:text-[#fde4b5]">
              Discord
            </a>
            <a
              href="https://github.com/shrey150/squaas"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[#fde4b5]"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
