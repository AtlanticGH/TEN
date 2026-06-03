import { Link } from 'react-router-dom'
import { Reveal } from '../components/shared/Reveal'

/* ─── Shared style tokens ──────────────────────────────────────────────── */
const SECTION_PAD = 'py-20 md:py-28 lg:py-32'
const CONTAINER = 'mx-auto max-w-7xl px-6 sm:px-8 lg:px-10'
const EYEBROW = 'block text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500 mb-4'
const HEADLINE = 'text-4xl md:text-5xl font-black leading-tight tracking-tight mb-6'
const ORANGE_GRADIENT = { backgroundImage: 'linear-gradient(135deg, #F97316, #FBBF24)' }

/* ─── Content data ─────────────────────────────────────────────────────── */
const FIRE = [
  {
    letter: 'F',
    title: 'Fostering Potential',
    body: 'Every great founder starts somewhere. We cultivate raw ambition into real-world success by creating environments where emerging entrepreneurs can grow with confidence and purpose.',
  },
  {
    letter: 'I',
    title: 'Igniting Innovation',
    body: 'Bold ideas create transformative futures. We encourage disruptive thinking, creative problem-solving and visionary leadership that inspires meaningful change.',
  },
  {
    letter: 'R',
    title: 'Resilience In Action',
    body: 'Growth is built through perseverance. We empower founders to navigate challenges with adaptability, courage and determination.',
  },
  {
    letter: 'E',
    title: 'Empowering Growth',
    body: 'Mentorship fuels transformation. Through guidance, strategic partnerships and opportunities, we equip members with the tools needed to elevate their ventures and impact.',
  },
]

const WHO_STATS = [
  { value: '100+', label: 'Future Founders' },
  { value: 'Mentorship', label: 'Driven Ecosystem' },
  { value: 'Quarterly', label: 'Pitch Experiences' },
  { value: 'Real', label: 'Industry Access' },
]

const TORCHBEARER_STATS = [
  { value: '24+', label: 'Years Leadership Experience' },
  { value: 'CEO', label: 'of Atlantic Catering' },
  { value: '600+', label: 'Employees Led' },
  { value: 'CNN', label: 'Featured Business Leader' },
]

const PROGRAMS = [
  {
    icon: '🔥',
    title: 'Ignition Labs',
    desc: 'Hands-on workshops equipping founders with practical skills in strategy, branding, finance, product development and business growth. From idea validation to execution.',
  },
  {
    icon: '⚡',
    title: 'Spark Challenge',
    desc: 'Competitive pitch experiences that sharpen ideas, build confidence and expose founders to expert feedback and recognition.',
  },
  {
    icon: '🎙',
    title: 'Fireside Dialogues',
    desc: 'Exclusive conversations with accomplished entrepreneurs, investors and industry leaders. Real stories. Real lessons. Real access.',
  },
  {
    icon: '🤝',
    title: 'Founder Mastermind',
    desc: 'Collaborative circles where founders discuss challenges, exchange ideas and receive strategic feedback from mentors and peers.',
  },
  {
    icon: '🌍',
    title: 'Impact Ventures',
    desc: 'Build businesses that create meaningful change. Innovation combined with social impact for ventures that create lasting value.',
  },
]

const GROWTH_CYCLE = [
  {
    num: '01',
    title: 'Weekly Momentum',
    tagline: 'Learn. Build. Present. Improve.',
    body: 'Weekly entrepreneurial tasks on ideation, research, business models and strategy. Peer reviews encourage accountability.',
  },
  {
    num: '02',
    title: 'Monthly Immersion',
    tagline: 'Workshops. Mentorship. Networking.',
    body: 'Expert-led sessions, progress reviews and meaningful networking. Personalised feedback while refining business approaches.',
  },
  {
    num: '03',
    title: 'Quarterly Elevation',
    tagline: 'Exposure. Impact. Transformation.',
    body: 'Pitch experiences, masterclasses and innovation challenges. Showcase growth and attract opportunities.',
  },
]

const TIERS = [
  {
    name: 'Aspiring Entrepreneurs',
    desc: 'For dreamers ready to begin transforming ideas into action.',
    cta: 'Apply Now',
    to: '/apply',
    featured: false,
  },
  {
    name: 'Early-Stage Founders',
    desc: 'For builders refining, growing and scaling their ventures.',
    cta: 'Apply Now',
    to: '/apply',
    featured: true,
  },
  {
    name: 'Mentors & Investors',
    desc: 'For experienced leaders ready to guide the next generation.',
    cta: 'Join Us',
    to: '/apply',
    featured: false,
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

const TESTIMONIALS = [
  {
    name: 'Future Founder',
    quote: 'Placeholder for founder transformation stories.',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Mentor Story',
    quote: 'Placeholder for mentorship impact experiences.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Community Impact',
    quote: 'Placeholder for ventures creating social change.',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
  },
]

/* ─── Small presentational helpers ─────────────────────────────────────── */
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

/* ─── Page ─────────────────────────────────────────────────────────────── */
export function HomePage() {
  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden bg-[#0A0A0A]">

      {/* ── SECTION 1 — HERO ─────────────────────────────────────────────── */}
      <section
        id="home-gateway"
        data-section="hero-gateway"
        className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden bg-[#0A0A0A]"
      >
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80"
          alt="Entrepreneurs collaborating around a table"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchpriority="high"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 50%, rgba(10,10,10,0.95) 100%)',
          }}
          aria-hidden="true"
        />

        <div className={`relative z-10 ${CONTAINER} pb-28 pt-36 md:pb-32 md:pt-40`}>
          <div className="max-w-4xl">
            <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[1.02] tracking-tight text-white ten-hero-text-shadow">
              <span className="block">Welcome to The Ember Network</span>
              <span
                className="block bg-clip-text text-transparent"
                style={{ ...ORANGE_GRADIENT, WebkitBackgroundClip: 'text' }}
              >
                Here, Small Sparks Ignite Big Dreams
              </span>
            </h1>
            <p className="mt-7 max-w-[640px] text-[17px] leading-[1.7] text-zinc-200/90">
              The Ember Network empowers emerging entrepreneurs through mentorship, innovation,
              community and transformational opportunities that turn ideas into thriving ventures.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/apply"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-orange-500 px-8 text-[15px] font-bold text-white shadow-glow transition-all duration-200 ease-out hover:bg-orange-400 active:scale-[0.98] sm:w-auto"
              >
                Become an Ember
              </Link>
              <Link
                to="/community"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-white/40 px-8 text-[15px] font-bold text-white backdrop-blur-sm transition-all duration-200 ease-out hover:border-white hover:bg-white/10 active:scale-[0.98] sm:w-auto"
              >
                Join The Network
              </Link>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-[scroll-bounce_1.5s_ease-in-out_infinite]"
          aria-hidden="true"
        >
          <svg className="h-6 w-6 text-white/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── SECTION 2 — THE SPARK ────────────────────────────────────────── */}
      <section className={`bg-[#0A0A0A] ${SECTION_PAD}`}>
        <div className={`${CONTAINER} flex flex-col items-center text-center`}>
          <Reveal className="max-w-[640px]">
            <span className={EYEBROW}>Our Purpose</span>
            <h2 className={`${HEADLINE} text-white`}>Every Venture Begins With a Spark</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-400">
              Entrepreneurship starts with belief, but growth requires guidance, community and
              opportunity. The Ember Network exists to transform raw ambition into lasting impact.
            </p>
          </Reveal>

          <Reveal delay={150} className="mt-14">
            <div className="relative mx-auto h-28 w-28">
              {[0, 0.6, 1.2].map((delay, i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-[pulse-ring_2.4s_ease-out_infinite]"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
              <div
                className="absolute inset-[22%] rounded-full animate-[ember-breathe_3s_ease-in-out_infinite]"
                style={{
                  background: 'radial-gradient(circle, #FBBF24 0%, #F97316 50%, #C2410C 100%)',
                  boxShadow: '0 0 40px rgba(249,115,22,0.8), 0 0 80px rgba(249,115,22,0.4)',
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 3 — WHO WE ARE ───────────────────────────────────────── */}
      <section className={`bg-white ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={EYEBROW}>Who We Are</span>
            <h2 className={`${HEADLINE} text-zinc-900`}>More Than A Network</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600">
              We are a transformative ecosystem for emerging entrepreneurs, equipping ambitious
              innovators with mentorship, strategic guidance, collaboration and the tools to thrive
              in today&rsquo;s world.
            </p>
            <p className="mx-auto mt-5 max-w-[640px] text-[17px] leading-[1.7] text-zinc-600">
              We exist to nurture bold thinkers, resilient builders and purpose-driven founders who
              are ready to shape industries and uplift communities.
            </p>
          </Reveal>

          {/* Mission + Vision */}
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Reveal
              as="article"
              delay={100}
              className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-8"
            >
              <p className={EYEBROW}>Our Mission</p>
              <p className="text-[16px] leading-[1.7] text-zinc-700">
                To ignite and sustain a thriving entrepreneurial ecosystem that empowers young
                innovators through mentorship, resources and opportunities to transform bold ideas
                into lasting ventures.
              </p>
            </Reveal>
            <Reveal
              as="article"
              delay={200}
              className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-8"
            >
              <p className={EYEBROW}>Our Vision</p>
              <p className="text-[16px] leading-[1.7] text-zinc-700">
                To build a global network of forward-thinking entrepreneurs who drive innovation,
                lead with resilience and create meaningful impact.
              </p>
            </Reveal>
          </div>

          {/* The FIRE Philosophy */}
          <Reveal className="mt-20 text-center">
            <span className={EYEBROW}>The FIRE Philosophy</span>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 md:text-3xl">
              What Keeps Our Flame Burning
            </h3>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FIRE.map(({ letter, title, body }, i) => (
              <Reveal
                key={letter}
                as="article"
                delay={(i + 1) * 100}
                className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-7 transition-all duration-300 hover:border-orange-500/50 hover:shadow-[0_0_40px_rgba(249,115,22,0.12)]"
              >
                <span className="text-5xl font-black text-orange-500">{letter}</span>
                <div className="mt-2 mb-4 h-[3px] w-10 rounded-full bg-orange-500" />
                <h4 className="text-lg font-bold text-white">{title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Stats strip — full-width dark band */}
        <div className="mt-20 border-y border-zinc-800 bg-zinc-950 py-12">
          <div className={`${CONTAINER} grid grid-cols-2 gap-8 md:grid-cols-4`}>
            {WHO_STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-orange-500 md:text-4xl">{value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — THE TORCHBEARER ──────────────────────────────────── */}
      <section className={`bg-[#111111] ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <Reveal className="flex flex-col items-center gap-10 lg:flex-row lg:items-stretch lg:gap-14">
            <div className="w-full lg:w-1/2">
              <div className="relative overflow-hidden rounded-2xl border border-zinc-800">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                  alt="Portrait of Maud Lindsay-Gamrat, founder of The Ember Network"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="w-full lg:flex lg:w-1/2 lg:flex-col lg:justify-center">
              <span className={EYEBROW}>Leadership</span>
              <h2 className={`${HEADLINE} text-white`}>Meet the Torchbearer</h2>
              <p className="text-2xl font-bold text-white">Maud Lindsay-Gamrat</p>
              <p className="mt-2 text-[16px] text-orange-400">
                Entrepreneur. Mentor. Builder of Possibilities.
              </p>
              <p className="mt-1 text-[15px] italic text-zinc-400">The Flame Behind the Vision</p>

              {/* Highlights strip */}
              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-zinc-800 pt-8 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {TORCHBEARER_STATS.map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-black text-orange-500">{value}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-zinc-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 5 — FOUNDER QUOTE ────────────────────────────────────── */}
      <section className="bg-[#0D0D0D] py-24">
        <Reveal>
          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <span
              className="pointer-events-none absolute -top-8 left-0 select-none font-serif text-[9rem] leading-none text-orange-500/20"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <blockquote className="relative z-10 text-2xl font-light italic leading-relaxed text-white md:text-3xl">
              When young people are empowered with guidance and opportunity, they don&rsquo;t just
              build businesses &mdash; they transform communities.
            </blockquote>
            <p className="mt-8 font-semibold text-orange-400">&mdash; Maud Lindsay-Gamrat, Founder</p>
          </div>
        </Reveal>
      </section>

      {/* ── SECTION 6 — PROGRAMS & EXPERIENCES ───────────────────────────── */}
      <section className={`bg-white ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={EYEBROW}>Programs &amp; Experiences</span>
            <h2 className={`${HEADLINE} text-zinc-900`}>How We Build Our Founders</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600">
              The Ember Network combines mentorship, practical learning and collaborative experiences
              to help entrepreneurs move confidently from idea to execution.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map(({ icon, title, desc }, i) => (
              <Reveal
                key={title}
                as="article"
                delay={(i % 3) * 100}
                className="cursor-pointer overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/60 hover:shadow-[0_20px_60px_rgba(249,115,22,0.15)]"
              >
                <div className="h-[3px] w-full bg-gradient-to-r from-orange-500 to-amber-400" />
                <div className="p-6">
                  <span className="text-3xl" aria-hidden="true">{icon}</span>
                  <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Growth Cycle timeline */}
          <Reveal className="mt-20 text-center">
            <span className={EYEBROW}>The Growth Cycle</span>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 md:text-3xl">
              A Rhythm Built for Momentum
            </h3>
          </Reveal>
          <div className="relative mt-12 flex flex-col gap-8 md:flex-row md:gap-6">
            {/* connector line (md+) */}
            <div
              className="absolute left-0 right-0 top-6 hidden h-[2px] bg-gradient-to-r from-orange-500/40 via-orange-500/40 to-amber-400/40 md:block"
              aria-hidden="true"
            />
            {GROWTH_CYCLE.map(({ num, title, tagline, body }, i) => (
              <Reveal
                key={num}
                as="article"
                delay={i * 100}
                className="relative flex-1 rounded-2xl border border-zinc-200 bg-[#F9FAFB] p-7"
              >
                <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-base font-black text-white">
                  {num}
                </span>
                <h4 className="mt-5 text-lg font-bold text-zinc-900">{title}</h4>
                <p className="mt-1 text-sm font-semibold text-orange-500">{tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7 — COMMUNITY & MEMBERSHIP ───────────────────────────── */}
      <section className={`bg-[#0A0A0A] ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={EYEBROW}>Community &amp; Membership</span>
            <h2 className={`${HEADLINE} text-white`}>Find Your Circle</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-400">
              Built for ambitious individuals ready to learn, collaborate and grow within a community
              of forward-thinking entrepreneurs.
            </p>
          </Reveal>

          {/* Membership tiers */}
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {TIERS.map(({ name, desc, cta, to, featured }, i) => (
              <Reveal
                key={name}
                as="article"
                delay={(i + 1) * 100}
                className={[
                  'relative flex flex-col rounded-2xl p-8',
                  featured
                    ? 'border-2 border-orange-500 bg-zinc-900 shadow-[0_0_50px_rgba(249,115,22,0.2)]'
                    : 'border border-zinc-800 bg-zinc-900',
                ].join(' ')}
              >
                {featured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                    Most Popular
                  </span>
                ) : null}
                <h3 className="text-xl font-bold text-white">{name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{desc}</p>
                <Link
                  to={to}
                  className={[
                    'mt-7 inline-flex min-h-[52px] items-center justify-center rounded-full px-8 text-[15px] font-bold transition-all duration-200 ease-out active:scale-[0.98]',
                    featured
                      ? 'bg-orange-500 text-white hover:bg-orange-400'
                      : 'border-2 border-zinc-700 text-white hover:border-orange-500',
                  ].join(' ')}
                >
                  {cta}
                </Link>
              </Reveal>
            ))}
          </div>

          {/* Benefits grid */}
          <Reveal className="mt-16">
            <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
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

      {/* ── SECTION 8 — IMPACT STORIES ───────────────────────────────────── */}
      <section className={`bg-[#F9FAFB] ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={EYEBROW}>Impact Stories</span>
            <h2 className={`${HEADLINE} text-zinc-900`}>Sparks Becoming Success Stories</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600">
              Every entrepreneur begins with potential. Through mentorship, collaboration and
              opportunity, those sparks evolve into stories of growth, resilience and transformation.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map(({ name, quote, avatar }, i) => (
              <Reveal
                key={name}
                as="article"
                delay={(i + 1) * 100}
                className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm"
              >
                <p className="flex-1 text-[16px] leading-[1.7] text-zinc-700">&ldquo;{quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <img
                    src={avatar}
                    alt={`${name} avatar`}
                    className="h-12 w-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  <span className="font-semibold text-zinc-900">{name}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 9 — JOIN THE MOVEMENT (CTA band) ─────────────────────── */}
      <section className="bg-[#F97316] py-20 md:py-28 lg:py-32">
        <div className={`${CONTAINER} text-center`}>
          <Reveal className="mx-auto max-w-3xl">
            <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-orange-100">
              Join The Movement
            </span>
            <h2 className="mb-6 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
              The Future Needs Builders Like You
            </h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-orange-50/90">
              Your ideas matter. Your vision deserves guidance. Your future deserves community. The
              Ember Network exists to help ambitious entrepreneurs ignite their potential and build
              lasting impact.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                to="/apply"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-white px-8 py-4 text-[15px] font-bold text-orange-600 transition-all duration-200 ease-out hover:bg-orange-50 active:scale-[0.98] sm:w-auto"
              >
                Become An Ember
              </Link>
              <Link
                to="/community"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-white px-8 py-4 text-[15px] font-bold text-white transition-all duration-200 ease-out hover:bg-white/10 active:scale-[0.98] sm:w-auto"
              >
                Join The Network
              </Link>
            </div>

            <p className="mt-8 text-sm font-medium text-orange-50/90">
              info@theembernetwork.com &middot; +233 50 940 4673 &middot; www.theembernetwork.com
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
