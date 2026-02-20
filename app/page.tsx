import Footer from '@/components/Footer';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection
        title="Level Up Your Game"
        subtitle="Discover the latest games, exclusive deals, and premium gaming experiences"
        ctaButtons={[
          { label: 'Shop Now', href: '/store' },
          { label: 'View Deals', href: '/deals' },
        ]}
        splineEmbed={true}
      />
      {/* Why GITNESS section */}
      <section className="relative py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 text-[#b8ffd0]"
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            Why GITNESS?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-14">
            Your one-stop destination for the best games, hottest deals, and an unmatched gaming experience.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="group relative rounded-3xl bg-gradient-to-b from-[#050509] to-[#0a0a12] border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-500 px-6 py-10 flex flex-col items-center text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(0,200,255,0.4)] group-hover:shadow-[0_0_50px_rgba(0,200,255,0.6)] transition-shadow duration-500">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="relative text-lg font-bold mb-3 text-white" style={{ fontFamily: 'var(--font-rajdhani)' }}>Massive Library</h3>
              <p className="relative text-sm text-gray-400 leading-relaxed">
                From AAA blockbusters to hidden indie gems — browse 20+ curated titles across every genre.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group relative rounded-3xl bg-gradient-to-b from-[#050509] to-[#0a0a12] border border-gray-800/50 hover:border-emerald-500/30 transition-all duration-500 px-6 py-10 flex flex-col items-center text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-[0_0_30px_rgba(52,211,153,0.4)] group-hover:shadow-[0_0_50px_rgba(52,211,153,0.6)] transition-shadow duration-500">
                <span className="text-2xl">🏷️</span>
              </div>
              <h3 className="relative text-lg font-bold mb-3 text-white" style={{ fontFamily: 'var(--font-rajdhani)' }}>Unbeatable Deals</h3>
              <p className="relative text-sm text-gray-400 leading-relaxed">
                Up to 50% off on top titles. Rotating flash sales and limited‑time bundles you won&apos;t find elsewhere.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group relative rounded-3xl bg-gradient-to-b from-[#050509] to-[#0a0a12] border border-gray-800/50 hover:border-purple-500/30 transition-all duration-500 px-6 py-10 flex flex-col items-center text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-[0_0_30px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] transition-shadow duration-500">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="relative text-lg font-bold mb-3 text-white" style={{ fontFamily: 'var(--font-rajdhani)' }}>Instant Access</h3>
              <p className="relative text-sm text-gray-400 leading-relaxed">
                Add to cart, checkout, and you&apos;re playing. No waiting, no hassle — instant digital delivery.
              </p>
            </div>

            {/* Card 4 */}
            <div className="group relative rounded-3xl bg-gradient-to-b from-[#050509] to-[#0a0a12] border border-gray-800/50 hover:border-amber-500/30 transition-all duration-500 px-6 py-10 flex flex-col items-center text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_0_30px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] transition-shadow duration-500">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="relative text-lg font-bold mb-3 text-white" style={{ fontFamily: 'var(--font-rajdhani)' }}>Top-Rated Titles</h3>
              <p className="relative text-sm text-gray-400 leading-relaxed">
                Every game is hand‑picked and critically acclaimed. We only stock titles rated 4+ stars.
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white/[0.03] border border-gray-800/40 py-6 px-4">
              <div className="text-3xl font-bold glow-text mb-1" style={{ fontFamily: 'var(--font-orbitron)' }}>20+</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Games Available</div>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-gray-800/40 py-6 px-4">
              <div className="text-3xl font-bold text-emerald-400 mb-1" style={{ fontFamily: 'var(--font-orbitron)' }}>50%</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Max Discount</div>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-gray-800/40 py-6 px-4">
              <div className="text-3xl font-bold text-purple-400 mb-1" style={{ fontFamily: 'var(--font-orbitron)' }}>6+</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Game Genres</div>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-gray-800/40 py-6 px-4">
              <div className="text-3xl font-bold text-amber-400 mb-1" style={{ fontFamily: 'var(--font-orbitron)' }}>24/7</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Instant Delivery</div>
            </div>
          </div>
        </div>
      </section>
      {/* Ready to Dominate section */}
      <section className="py-20 bg-gradient-to-b from-black to-[#050509]">
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 glow-text"
            style={{
              fontFamily: 'var(--font-orbitron)',
            }}
          >
            Ready to Dominate?
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-10">
            Join thousands of gamers who trust GITNESS for their competitive edge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/store"
              className="px-10 py-3 rounded-full font-semibold text-sm tracking-wide text-white bg-gradient-to-r from-[#009dff] via-[#006dff] to-[#001bff] shadow-[0_0_40px_rgba(0,157,255,0.7)] hover:opacity-90 transition"
            >
              EXPLORE THE STORE
            </a>
            <a
              href="/deals"
              className="px-10 py-3 rounded-full font-semibold text-sm tracking-wide text-white bg-gradient-to-r from-[#ff7a3c] via-[#ff5b2a] to-[#ff3b1a] shadow-[0_0_40px_rgba(255,90,40,0.7)] hover:opacity-90 transition"
            >
              CHECK DEALS
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
