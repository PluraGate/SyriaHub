import Link from 'next/link'
import { ArrowRight, Sparkles, Search, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar user={user} />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="section pt-20 md:pt-28 lg:pt-36">
          <div className="container-narrow text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 dark:bg-primary-light/10 border border-primary/10 dark:border-primary-light/20 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-accent dark:text-accent-light" />
              <span className="text-sm font-medium text-primary dark:text-primary-light">
                Minimalist Research Platform
              </span>
            </div>

            <h1 className="text-balance mb-6">
              Research Made Simple
            </h1>
            
            <p className="text-lg md:text-xl text-text-light dark:text-dark-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              A minimalist platform for collaborative knowledge sharing. 
              Create, discover, and organize research with clarity and focus.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <>
                  <Link href="/feed" className="btn btn-primary px-8 py-4 text-lg group">
                    Go to Feed
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/editor" className="btn btn-outline px-8 py-4 text-lg">
                    Create Post
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signup" className="btn btn-primary px-8 py-4 text-lg group">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/feed" className="btn btn-outline px-8 py-4 text-lg">
                    Browse Posts
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section bg-background-light dark:bg-dark-surface/50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="mb-4">Built for Clarity</h2>
              <p className="text-lg text-text-light dark:text-dark-text-muted max-w-2xl mx-auto">
                Everything you need to share and discover research, without the clutter.
              </p>
            </div>

            <div className="grid-auto max-w-5xl mx-auto">
              {/* Feature 1 */}
              <div className="card p-8 text-center group hover:shadow-soft-lg transition-all">
                <div className="w-14 h-14 bg-primary/10 dark:bg-primary-light/20 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-primary dark:text-primary-light" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">
                  Clean Writing
                </h3>
                <p className="text-text-light dark:text-dark-text-muted leading-relaxed">
                  Distraction-free editor focused on your ideas, not formatting.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-8 text-center group hover:shadow-soft-lg transition-all">
                <div className="w-14 h-14 bg-accent/10 dark:bg-accent-light/20 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <Search className="w-7 h-7 text-accent dark:text-accent-light" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">
                  Easy Discovery
                </h3>
                <p className="text-text-light dark:text-dark-text-muted leading-relaxed">
                  Find relevant research with intuitive tagging and search.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-8 text-center group hover:shadow-soft-lg transition-all">
                <div className="w-14 h-14 bg-primary/10 dark:bg-primary-light/20 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-primary dark:text-primary-light" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">
                  Collaboration
                </h3>
                <p className="text-text-light dark:text-dark-text-muted leading-relaxed">
                  Share knowledge and connect with researchers worldwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="section">
            <div className="container-narrow">
              <div className="card p-10 md:p-16 text-center bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary-light/10 dark:to-accent-light/10 border-primary/10 dark:border-primary-light/20">
                <h2 className="mb-4">Ready to start sharing?</h2>
                <p className="text-lg text-text-light dark:text-dark-text-muted max-w-xl mx-auto mb-8">
                  Join our community of researchers and start contributing to collaborative knowledge.
                </p>
                <Link href="/auth/signup" className="btn btn-primary px-8 py-4 text-lg inline-flex items-center gap-2">
                  Create Your Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
