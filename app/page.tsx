"use client"

import { useAuth } from "@/app/contexts/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import "./home.css"
import { programsInfo, tesdaprogramsInfo, ProgramInfo } from "@/lib/program_info"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "student") {
        router.push("/student/dashboard")
      } else if (user.role === "teacher") {
        router.push("/teacher/dashboard")
      } else if (user.role === "admin") {
        router.push("/admin/dashboard")
      }
    }
  }, [user, isLoading, router])

  const [activeTab, setActiveTab] = useState('mission')
  const [progFilter, setProgFilter] = useState<'All' | 'SHS' | 'College' | 'Tesda'>('All')
  const [selectedProgram, setSelectedProgram] = useState<ProgramInfo | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });

    // Delay to ensure DOM is ready
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [])



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F2E8]">
        <div className="space-y-4 text-center">
          <div className="inline-flex space-x-2">
            <div className="w-3 h-3 bg-[#C9962A] rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-[#C9962A] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-3 h-3 bg-[#C9962A] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="home-header">
        <div className="header-brand">
          <img src="/header.png" alt="College of Saint Amatiel Logo" className="header-logo" />
          <div className="header-title">
            College of Saint Amatiel
            <span>Student Portal</span>
          </div>
        </div>
        <nav className="header-nav">
          <Link href="/login" className="btn-outline">Login</Link>
          <Link href="/register" className="btn-solid">Register</Link>
        </nav>
      </header>

      <section id="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <img src="/image.png" alt="College of Saint Amatiel Logo" className="hero-logo-img" />
          <div className="hero-school-name">College of Saint Amatiel - Malabon</div>
          <div className="hero-divider"></div>
          <h1 className="hero-tagline">Basta Amatelian,<br />Nakahanda sa Kinabukasan.</h1>
          <div className="hero-buttons">
            <Link href="/login" className="btn-hero-primary">Login to Portal</Link>
            <Link href="/register" className="btn-hero-secondary">Create Account</Link>
          </div>
        </div>
      </section>

      <section id="mission-vision">
        <div className="mv-container">
          <div className="reveal">
            <div className="section-label">Our Purpose</div>
            <h2 className="section-title">Mission & Vision</h2>
            <div className="section-underline"></div>
          </div>

          <div className="reveal">
            <div className="mv-tabs">
              <button className={`mv-tab ${activeTab === 'mission' ? 'active' : ''}`} onClick={() => setActiveTab('mission')}>Mission</button>
              <button className={`mv-tab ${activeTab === 'vision' ? 'active' : ''}`} onClick={() => setActiveTab('vision')}>Vision</button>
              <button className={`mv-tab ${activeTab === 'hymn' ? 'active' : ''}`} onClick={() => setActiveTab('hymn')}>Hymn</button>
            </div>
          </div>

          {/* Mission Panel */}
          <div className={`mv-panel ${activeTab === 'mission' ? 'active' : ''} reveal`} id="panel-mission">
            <div>
              <div className="mv-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="mv-text-title">Saint Amatiel's Mission</h3>
              <p className="mv-body">To promote equitable access to technical-vocational ducational as its share in the formation of a more progressive resilient and humans society of capacitated citizens in the country.</p>
            </div>
            <div className="mv-visual">
              <img src="/header.png" alt="Students at CSA" />
              <div className="mv-visual-overlay"></div>
            </div>
          </div>

          {/* Vision Panel */}
          <div className={`mv-panel ${activeTab === 'vision' ? 'active' : ''} reveal`} id="panel-vision">
            <div>
              <div className="mv-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" /><path d="M20.188 10.934a8 8 0 1 1-16.376 0M12 21v-3" />
                </svg>
              </div>
              <h3 className="mv-text-title">Saint Amatiel's Vision</h3>
              <p className="mv-body">An academic system quality higher education of relevant technical and vocational knowledge, skills and values, industry sensitive and community service driven programs responding to the needs of the country and the global community as well.</p>
              <p className="mv-body" style={{ marginTop: '1rem' }}>test</p>
            </div>
            <div className="mv-visual">
              <img src="/header.png" alt="CSA Campus" />
              <div className="mv-visual-overlay"></div>
            </div>
          </div>

          {/* Hymn Panel */}
          <div className={`mv-panel ${activeTab === 'hymn' ? 'active' : ''} reveal`} id="panel-hymn" >
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>

              <div className="mv-icon-box" style={{ margin: '0 auto 1.5rem' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M20.188 10.934a8 8 0 1 1-16.376 0M12 21v-3" />
                </svg>
              </div>

              <h3 className="mv-text-title">Saint Amatiel Hymn</h3>

              <p className="mv-body" style={{ marginTop: '1rem', lineHeight: '1.9' }}>
                Hail Alma Mater, St. Amatiel <br />
                All the skills you bring us <br />
                We know we can show it
              </p>

              <p className="mv-body" style={{ marginTop: '1rem', lineHeight: '1.9' }}>
                Hail Alma Mater, St. Amatiel. <br />
                All the things we do here <br />
                We know we can prove it <br />
                We know we can prove it
              </p>

              <h3 className="mv-text-title" style={{ marginTop: '1.5rem' }}>Chorus</h3>

              <p className="mv-body" style={{ marginTop: '1rem', lineHeight: '1.9' }}>
                All the laughter and the tears <br />
                Make us better person here <br />
                There's no greater care than this <br />
                You have taught our talent here <br />
                You have filled our experience <br />
                What can we miss when we're gone!
              </p>

              <p className="mv-body" style={{ marginTop: '1rem', lineHeight: '1.9' }}>
                Hail Alma Mater, St. Amatiel <br />
                All the things we gain here <br />
                We know we can prove it
              </p>

              <h3 className="mv-text-title" style={{ marginTop: '1.5rem' }}>
                Repeat Chorus x2
              </h3>

            </div>
          </div>

          {/* About Section */}
          <div className="about-block reveal" style={{ marginTop: '5rem' }}>
            <div className="about-img-wrap" style={{ position: 'relative' }}>
              <img src="/school.png" alt="About CSA" />
              <div className="about-img-badge">2008<span>Est.</span></div>
            </div>
            <div className="about-text">
              <div className="section-label">About the School</div>
              <h2 className="section-title">Welcome to Saint Amatiel College</h2>
              <div className="section-underline"></div>
              <p className="about-body">
                where we strive to build a community of learners equipped with knowledge, skills, and values to face the challenges of tomorrow. Through quality education, practical experiences, and a supportive environment, we aim to shape individuals who are ready to succeed in their chosen fields and contribute meaningfully to society.
              </p>
              <div className="about-stats">
                <div className="stat-item">
                  <span className="stat-num">18</span>
                  <span className="stat-label">Years of Service</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num">10+</span>
                  <span className="stat-label">Programs Offered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section id="programs">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="reveal">
            <div className="section-label">Academic Excellence</div>
            <h2 className="section-title">Programs Offered</h2>
            <div className="section-underline"></div>
            <p style={{ fontSize: '.98rem', color: 'rgba(247,242,232,.55)', marginBottom: '2rem', maxWidth: '560px', lineHeight: 1.8, fontWeight: 300 }}>
              Discover a wide range of undergraduate and graduate programs designed to equip you for the careers of tomorrow.
            </p>
            <div className="programs-filter">
              <button className={`filter-btn ${progFilter === 'All' ? 'active' : ''}`} onClick={() => setProgFilter('All')}>All Strands | Courses</button>
              <button className={`filter-btn ${progFilter === 'SHS' ? 'active' : ''}`} onClick={() => setProgFilter('SHS')}>SHS Strands</button>
              <button className={`filter-btn ${progFilter === 'College' ? 'active' : ''}`} onClick={() => setProgFilter('College')}>College</button>
              <button className={`filter-btn ${progFilter === 'Tesda' ? 'active' : ''}`} onClick={() => setProgFilter('Tesda')}>Tesda Programs</button>
            </div>
          </div>
          <div className="programs-grid reveal">
            {[...programsInfo, ...tesdaprogramsInfo]
              .filter(p => progFilter === 'All' || p.category === progFilter)
              .map(prog => (
                <div key={prog.id} className="prog-card" onClick={() => setSelectedProgram(prog)}>
                  {prog.coverImg ? (
                    <img src={prog.coverImg} className="prog-img" alt={prog.name} />
                  ) : (
                    <div className="prog-img" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(247,242,232,.3)' }}>CSA Program</div>
                  )}
                  <div className="prog-body">
                    <span className="prog-badge">{prog.badge}</span>
                    <div className="prog-name">{prog.name}</div>
                    <p className="prog-desc">{prog.desc}</p>
                  </div>
                  <div className="prog-footer">
                    <span className="prog-years">{prog.duration}</span>
                  </div>
                </div>
              ))}
          </div>
          <div className="reveal" style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/register" className="btn-hero-primary" style={{ display: 'inline-block' }}>Join Us Today →</Link>
          </div>
        </div>
      </section>


      <section id="faculty">
        <div className="faculty-container">
          <div className="reveal">
            <div className="section-label">Our People</div>
            <h2 className="section-title">Faculty Organizational Chart</h2>
            <div className="section-underline" style={{ background: 'var(--gold)', marginBottom: '3rem' }}></div>
          </div>

          <div className="reveal">
            <div className="faculty-frame">
              <img src="/org_chart.png" alt="Faculty Organizational Chart" className="org-chart-img" />
            </div>
          </div>
        </div>
      </section>



      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '.75rem' }}>
              <svg width="36" height="36" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="38" stroke="#C9962A" strokeWidth="2" />
                <polygon points="40,22 44,34 57,34 47,42 51,55 40,47 29,55 33,42 23,34 36,34" fill="#C9962A" opacity=".9" />
              </svg>
              <div className="footer-brand-name">College of Saint Amatiel</div>
            </div>
            <div className="footer-divider-gold"></div>
            <p className="footer-tagline">Forming Hearts. Shaping Futures. Serving the community through faith, learning, and excellence since 2010.</p>
            <div className="footer-contact" style={{ marginTop: '1.25rem' }}>
              <div>📍 <br />118 Int. Gen. Luna St, Malabon, 1470 Metro Manila</div>
              <div>📞 (02) 8351 4993</div>
            </div>
          </div>


          <div>
            <div className="footer-col-title">Where to Find Us</div>
            <img src="/drone_view.png" alt="Aerial view of College of Saint Amatiel campus" style={{ borderRadius: '6px', width: '100%', height: '200px', objectFit: 'cover', marginTop: '0.75rem' }} />
          </div>

          <div>
            <div className="footer-col-title">Quick Links</div>
            <ul className="footer-links">
              <li><a href="#">Home</a></li>
              <li><a href="#">Programs Offered</a></li>
              <li><a href="#">Admissions</a></li>
              <li><a href="#">Faculty & Staff</a></li>
              <li><a href="#">News & Events</a></li>
              <li><a href="#">Alumni</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Student Portal</div>
            <ul className="footer-links">
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/register">Register</Link></li>
              <li><a href="#">Grade Inquiry</a></li>
              <li><a href="#">Document Request</a></li>
              <li><a href="#">Contact Admin</a></li>
              <li><a href="#">Help & Support</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">© 2025 College of Saint Amatiel. All rights reserved.</div>
          <div className="footer-motto">"Veritas et Lux" — Truth and Light</div>
        </div>
      </footer>

      {selectedProgram && (
        <div className="modal-overlay" onClick={() => setSelectedProgram(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProgram(null)}>×</button>

            {selectedProgram.category === 'College' && selectedProgram.modalImg && (
              <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={selectedProgram.modalImg} alt={selectedProgram.name} style={{ width: '100%', height: '500px', objectFit: 'cover', display: 'block' }} />
              </div>
            )}

            <span className="modal-badge">{selectedProgram.badge}</span>
            <h3 className="modal-title">{selectedProgram.name}</h3>
            <div className="modal-subtitle">{selectedProgram.desc}</div>
            <p className="modal-desc">{selectedProgram.fullDesc}</p>
            {selectedProgram.requirements && selectedProgram.requirements.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontFamily: 'var(--sans)', fontSize: '.9rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.75rem' }}>Requirements:</h4>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: 'var(--text)', fontSize: '.9rem', lineHeight: '1.6', margin: 0 }}>
                  {selectedProgram.requirements.map((req, idx) => <li key={idx} style={{ marginBottom: '.25rem' }}>{req}</li>)}
                </ul>
              </div>
            )}
            <div className="modal-footer">
              <span className="modal-duration">{selectedProgram.duration}</span>
              <Link href="/register" className="btn-solid" onClick={() => setSelectedProgram(null)}>Apply Now</Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
