'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

/**
 * ComingSoon - Under Development Page
 * 
 * Design DNA: SyriaHub dark mode, maximum restraint
 * - Dark teal palette matching platform
 * - Platform logo and cover image with subtle parallax
 * - Serif for heading (canonical register)
 * - No CTAs, no forms, no dates, no countdowns
 * - Tone: temporarily inaccessible, not absent
 */
export function ComingSoon({ locale = 'en' }: { locale?: string }) {
  const isArabic = locale === 'ar'
  const dir = isArabic ? 'rtl' : 'ltr'
  
  // Subtle mouse-based parallax
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setOffset({ x, y })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      dir={dir}
      style={{
        backgroundColor: '#0A1B1D',
      }}
    >
      {/* Cover image - subtle background with parallax */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-[-20px] transition-transform duration-700 ease-out"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(1.05)`,
          }}
        >
          <Image
            src="/covers/Pluragate_cover_Dark_3200x1200.jpeg"
            alt=""
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        {/* Gradient overlay for text legibility */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(10, 27, 29, 0.7) 0%, rgba(10, 27, 29, 0.95) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Language switcher - top, mobile-style positioning */}
        <div className="absolute top-4 right-4 flex items-center gap-1 text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          <a
            href={`/ar/coming-soon`}
            className="px-2 py-1 rounded transition-colors duration-200"
            style={{
              color: isArabic ? '#E8EDEE' : '#5A6A72',
              fontWeight: isArabic ? 500 : 400,
            }}
          >
            AR
          </a>
          <span style={{ color: '#3A4A52' }}>|</span>
          <a
            href={`/en/coming-soon`}
            className="px-2 py-1 rounded transition-colors duration-200"
            style={{
              color: !isArabic ? '#E8EDEE' : '#5A6A72',
              fontWeight: !isArabic ? 500 : 400,
            }}
          >
            EN
          </a>
        </div>

        <div className="max-w-xl text-center space-y-10">
          
          {/* Logo - slightly subdued to avoid hero brand feel */}
          <div className="flex justify-center mb-3">
            <Image
              src="/icons/Pluragate_512x512_NoDot.svg"
              alt="SyriaHub"
              width={80}
              height={80}
              className="opacity-90"
              priority
            />
          </div>

          {/* Wordmark - matches navbar: font-display (Outfit), bold */}
          <h1 
            className="text-4xl md:text-5xl tracking-tight font-display font-bold"
            style={{
              color: '#E8EDEE',
              letterSpacing: '-0.02em',
            }}
          >
            SyriaHub
          </h1>

          {/* Status block - restrained, institutional */}
          <div className="space-y-5">
            <p 
              className="text-lg md:text-xl leading-relaxed"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 400,
                color: '#B8C8CC',
              }}
            >
              {isArabic 
                ? 'هذه المنصة قيد التطوير النشط.'
                : 'This platform is under active development.'
              }
            </p>
            
            <p 
              className="text-base md:text-lg leading-relaxed"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 400,
                color: '#8A9EA3',
              }}
            >
              {isArabic
                ? 'نُعدّ الإصدار العام الأول بعناية.'
                : 'We are preparing the initial public release with care.'
              }
            </p>
          </div>

          {/* Divider - subtle */}
          <div 
            className="w-16 mx-auto"
            style={{
              height: '1px',
              backgroundColor: '#2A5558',
            }}
          />

          {/* Access statement */}
          <p 
            className="text-base leading-relaxed"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: 400,
              color: '#8A9EA3',
            }}
          >
            {isArabic
              ? 'سيُفتح الوصول عندما يكون النظام جاهزاً.'
              : 'Access will open when the system is ready.'
            }
          </p>
        </div>
      </main>

      {/* Foundation attribution - footer, quiet */}
      <footer className="relative z-10 py-8 text-center space-y-3">
        <p 
          className="text-sm"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
            color: '#5A6A72',
            letterSpacing: '0.02em',
          }}
        >
          {isArabic
            ? 'تحت إشراف مؤسسة PluraGate'
            : 'Governed under the Pluragate Foundation'
          }
        </p>
        
        {/* Contact links */}
        <div 
          className="flex items-center justify-center gap-4 text-sm"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
          }}
        >
          <a 
            href="https://pluragate.org"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200"
            style={{ color: '#4AA3A5' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#7ABFC0'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#4AA3A5'}
          >
            pluragate.org
          </a>
          <span style={{ color: '#3A4A52' }}>·</span>
          <a 
            href="mailto:admin@pluragate.org"
            className="transition-colors duration-200"
            style={{ color: '#4AA3A5' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#7ABFC0'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#4AA3A5'}
          >
            admin@pluragate.org
          </a>
        </div>
      </footer>
    </div>
  )
}

export default ComingSoon
