import { Link } from 'react-router-dom'
import { Reveal } from '../components/shared/Reveal'

const CONTAINER = 'mx-auto max-w-7xl px-6 sm:px-8 lg:px-10'
const EYEBROW = 'block text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500 mb-4'

const PILLARS = [
  {
    title: 'Learn',
    body: 'Practical workshops, masterclasses and structured tracks that move you from idea to execution.',
  },
  {
    title: 'Collaborate',
    body: 'Founder circles and peer reviews where ambitious builders sharpen each other every week.',
  },
  {
    title: 'Grow',
    body: 'Mentorship, pitch experiences and industry access that turn momentum into lasting ventures.',
  },
]

const BENEFITS = [
  'Access to Mentorship',
  'Collaborative Community',
  'Networking Opportunities',
  'Increased Visibility',
  'Hands-On Learning',
  'Funding & Growth Opportunities',
  'Personal Development',
  'Exclusive Events & Experiences',
]

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-orange-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function JoinCommunityPage() {
  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden bg-[#0A0A0A]">
      {/* Intro band */}
      <section className="bg-[#0A0A0A] px-6 pb-20 pt-36 sm:px-8 md:pb-28 md:pt-44 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className={EYEBROW}>Community &amp; Membership</span>
            <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-black leading-[1.04] tracking-tight text-white">
              Find Your Circle
            </h1>
            <p className="mt-6 max-w-[640px] text-[17px] leading-[1.7] text-zinc-400">
              The Ember Network is built for ambitious individuals ready to learn, collaborate and
              grow within a community of forward-thinking entrepreneurs. Join a movement where small
              sparks ignite big dreams.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/apply"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-orange-500 px-8 text-[15px] font-bold text-white shadow-glow transition-all duration-200 ease-out hover:bg-orange-400 active:scale-[0.98] sm:w-auto"
              >
                Become an Ember
              </Link>
              <Link
                to="/programs"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-white/40 px-8 text-[15px] font-bold text-white transition-all duration-200 ease-out hover:border-white hover:bg-white/10 active:scale-[0.98] sm:w-auto"
              >
                Explore Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-white py-20 md:py-28">
        <div className={CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={EYEBROW}>Why Join</span>
            <h2 className="text-4xl font-black leading-tight tracking-tight text-zinc-900 md:text-5xl">
              A Community Built for Builders
            </h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PILLARS.map(({ title, body }, i) => (
              <Reveal
                key={title}
                as="article"
                delay={(i + 1) * 100}
                className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-8"
              >
                <h3 className="text-xl font-bold text-zinc-900">{title}</h3>
                <p className="mt-3 text-[15px] leading-[1.7] text-zinc-600">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#0A0A0A] py-20 md:py-28">
        <div className={CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={EYEBROW}>Member Benefits</span>
            <h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
              Everything You Need to Grow
            </h2>
          </Reveal>
          <Reveal className="mt-12">
            <ul className="mx-auto grid max-w-3xl grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-[15px] text-zinc-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-[#F97316] py-20 md:py-28">
        <div className={`${CONTAINER} text-center`}>
          <Reveal className="mx-auto max-w-3xl">
            <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-orange-100">
              Join The Movement
            </span>
            <h2 className="mb-6 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
              Your Spark Belongs Here
            </h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-orange-50/90">
              Take the first step. Apply today and join a community committed to turning bold ideas
              into thriving ventures.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                to="/apply"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-white px-8 py-4 text-[15px] font-bold text-orange-600 transition-all duration-200 ease-out hover:bg-orange-50 active:scale-[0.98] sm:w-auto"
              >
                Become An Ember
              </Link>
              <Link
                to="/contact"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-white px-8 py-4 text-[15px] font-bold text-white transition-all duration-200 ease-out hover:bg-white/10 active:scale-[0.98] sm:w-auto"
              >
                Talk To Us
              </Link>
            </div>
            <p className="mt-8 text-sm font-medium text-orange-50/90">
              info@theembernetwork.com &middot; +233 50 940 4673
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
