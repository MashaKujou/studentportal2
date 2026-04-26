"use client"

import { useAuth } from "@/app/contexts/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import "./home.css"

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

  const frameRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [scaleDisplay, setScaleDisplay] = useState(100)

  useEffect(() => {
    if (isLoading) return;
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;

    const PADDING = 20;
    let currentScale = 1, ox = PADDING, oy = PADDING;
    let dragging = false, startX = 0, startY = 0, startOX = 0, startOY = 0;

    const apply = () => {
      const fw = frame.clientWidth;
      const fh = frame.clientHeight;
      const cw = canvas.scrollWidth * currentScale;
      const ch = canvas.scrollHeight * currentScale;

      if (cw > fw) {
        ox = Math.min(PADDING, Math.max(ox, fw - cw - PADDING));
      } else {
        ox = Math.max(PADDING, Math.min(ox, fw - cw - PADDING));
      }

      if (ch > fh) {
        oy = Math.min(PADDING, Math.max(oy, fh - ch - PADDING));
      } else {
        oy = Math.max(PADDING, Math.min(oy, fh - ch - PADDING));
      }

      canvas.style.transform = `translate(${ox}px, ${oy}px) scale(${currentScale})`;
      setScaleDisplay(Math.round(currentScale * 100));
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      currentScale = Math.min(Math.max(currentScale + delta, 0.3), 3);
      apply();
    };

    const handleMouseDown = (e: MouseEvent) => {
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      startOX = ox; startOY = oy;
      frame.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      ox = startOX + (e.clientX - startX);
      oy = startOY + (e.clientY - startY);
      apply();
    };

    const handleMouseUp = () => {
      dragging = false;
      frame.style.cursor = 'grab';
    };

    // touch support
    let lastDist: number | null = null;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        dragging = true;
        startX = e.touches[0].clientX; startY = e.touches[0].clientY;
        startOX = ox; startOY = oy;
      }
      if (e.touches.length === 2) {
        lastDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
      if (e.cancelable) e.preventDefault();
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && dragging) {
        ox = startOX + (e.touches[0].clientX - startX);
        oy = startOY + (e.touches[0].clientY - startY);
        apply();
      }
      if (e.touches.length === 2 && lastDist !== null) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        currentScale = Math.min(Math.max(currentScale * (dist / lastDist), 0.3), 3);
        lastDist = dist;
        apply();
      }
      if (e.cancelable) e.preventDefault();
    };
    const handleTouchEnd = () => {
      dragging = false;
      lastDist = null;
    };

    frame.addEventListener('wheel', handleWheel, { passive: false });
    frame.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    frame.addEventListener('touchstart', handleTouchStart, { passive: false });
    frame.addEventListener('touchmove', handleTouchMove, { passive: false });
    frame.addEventListener('touchend', handleTouchEnd);

    apply();

    // expose zoom controls to window so buttons can use it
    (window as any).__zoomIn = () => { currentScale = Math.min(currentScale + 0.2, 3); apply(); };
    (window as any).__zoomOut = () => { currentScale = Math.max(currentScale - 0.2, 0.3); apply(); };
    (window as any).__zoomReset = () => { currentScale = 1; ox = PADDING; oy = PADDING; apply(); };

    return () => {
      frame.removeEventListener('wheel', handleWheel);
      frame.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      frame.removeEventListener('touchstart', handleTouchStart);
      frame.removeEventListener('touchmove', handleTouchMove);
      frame.removeEventListener('touchend', handleTouchEnd);
      delete (window as any).__zoomIn;
      delete (window as any).__zoomOut;
      delete (window as any).__zoomReset;
    };
  }, [isLoading]);

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
          <p className="hero-sub">test</p>
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
              <h3 className="mv-text-title">Our Mission</h3>
              <p className="mv-body">test</p>
              <p className="mv-body" style={{ marginTop: '1rem' }}>test</p>
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
              <h3 className="mv-text-title">Our Vision</h3>
              <p className="mv-body">test</p>
              <p className="mv-body" style={{ marginTop: '1rem' }}>test</p>
            </div>
            <div className="mv-visual">
              <img src="/header.png" alt="CSA Campus" />
              <div className="mv-visual-overlay"></div>
            </div>
          </div>

          {/* Hymn Panel */}
          <div className={`mv-panel ${activeTab === 'hymn' ? 'active' : ''} reveal`} id="panel-hymn">
            <div>
              <div className="mv-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" /><path d="M20.188 10.934a8 8 0 1 1-16.376 0M12 21v-3" />
                </svg>
              </div>
              <h3 className="mv-text-title">Our Hymn</h3>
              <p className="mv-body">test</p>
              <p className="mv-body" style={{ marginTop: '1rem' }}>test</p>
            </div>
            <div className="mv-visual">
              <img src="/header.png" alt="CSA Campus" />
              <div className="mv-visual-overlay"></div>
            </div>
          </div>

          {/* About Section */}
          <div className="about-block reveal" style={{ marginTop: '5rem' }}>
            <div className="about-img-wrap">
              <img src="/school.png" alt="About CSA" />
              <div className="about-img-badge">2010<span>Est.</span></div>
            </div>
            <div className="about-text">
              <div className="section-label">About the School</div>
              <h2 className="section-title">A Legacy of Excellence</h2>
              <div className="section-underline"></div>
              <p className="about-body">test</p>
              <p className="about-body">
                Accredited by the Commission on Higher Education (CHED) and recognized by various accrediting bodies, CSA offers a broad array of programs that prepare graduates for leadership roles in business, education, health sciences, technology, and the arts.
              </p>
              <div className="about-stats">
                <div className="stat-item">
                  <span className="stat-num">17</span>
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

      <section id="faculty">
        <div className="faculty-container">
          <div className="reveal">
            <div className="section-label">Our People</div>
            <h2 className="section-title">Faculty Organizational Chart</h2>
            <div className="section-underline" style={{ background: 'var(--gold)' }}></div>
            <p style={{ fontSize: '.95rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              Use the controls to zoom · Drag to pan · Scroll to zoom
            </p>
          </div>

          <div className="reveal">
            {/* Zoom Controls */}
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={() => (window as any).__zoomIn?.()}>+</button>
              <button className="zoom-btn" onClick={() => (window as any).__zoomOut?.()}>−</button>
              <span className="zoom-label">{scaleDisplay}%</span>
              <button className="zoom-reset" onClick={() => (window as any).__zoomReset?.()}>Reset View</button>
            </div>

            {/* Pannable / Zoomable Frame */}
            <div className="faculty-frame" id="facultyFrame" ref={frameRef}>
              <div className="faculty-canvas" id="facultyCanvas" ref={canvasRef}>
                <img src="/org_chart.png" alt="Faculty Organizational Chart" className="org-chart-img" draggable="false" />
              </div>
              <div className="faculty-frame-hint">🔍 Scroll to zoom · Drag to pan</div>
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
            <p style={{ fontSize: '.98rem', color: 'rgba(247,242,232,.55)', marginBottom: '3rem', maxWidth: '560px', lineHeight: 1.8, fontWeight: 300 }}>
              Discover a wide range of undergraduate and graduate programs designed to equip you for the careers of tomorrow.
            </p>
          </div>
          <div className="programs-grid reveal">
            <div className="prog-card">
              <img src="" className="prog-img" alt="Education" />
              <div className="prog-body">
                <span className="prog-badge">Senior High School Track (Academic Strand)</span>
                <div className="prog-name">ABM</div>
                <p className="prog-desc">Test</p>
              </div>
              <div className="prog-footer">
                <span className="prog-years">2-Year Program</span>
              </div>
            </div>

            <div className="prog-card">
              <img src="" className="prog-img" alt="Nursing" />
              <div className="prog-body">
                <span className="prog-badge">Senior High School Track (Academic Strand)</span>
                <div className="prog-name">GAS</div>
                <p className="prog-desc">Test</p>
              </div>
              <div className="prog-footer">
                <span className="prog-years">2-Year Program</span>
              </div>
            </div>

            <div className="prog-card">
              <img src="" className="prog-img" alt="IT" />
              <div className="prog-body">
                <span className="prog-badge">Senior High School Track (Academic Strand)</span>
                <div className="prog-name">HUMSS</div>
                <p className="prog-desc">test</p>
              </div>
              <div className="prog-footer">
                <span className="prog-years">2-Year Program</span>
              </div>
            </div>

            <div className="prog-card">
              <img src="" className="prog-img" alt="Business" />
              <div className="prog-body">
                <span className="prog-badge">Senior High School Track (Tech-Voc Strand)</span>
                <div className="prog-name">HE</div>
                <p className="prog-desc">test</p>
              </div>
              <div className="prog-footer">
                <span className="prog-years">2-Year Program</span>
              </div>
            </div>

            <div className="prog-card">
              <img src="" className="prog-img" alt="Business" />
              <div className="prog-body">
                <span className="prog-badge">Senior High School Track (Tech-Voc Strand)</span>
                <div className="prog-name">ICT</div>
                <p className="prog-desc">test</p>
              </div>
              <div className="prog-footer">
                <span className="prog-years">2-Year Program</span>
              </div>
            </div>

            <div className="prog-card">
              <img src="" className="prog-img" alt="Engineering" />
              <div className="prog-body">
                <span className="prog-badge">Bachelor of Science</span>
                <div className="prog-name">BS Management Accounting</div>
                <p className="prog-desc">test</p>
              </div>
              <div className="prog-footer">
                <span className="prog-years">4-Year Program</span>
              </div>
            </div>

            <div className="prog-card">
              <img src="" className="prog-img" alt="Psychology" />
              <div className="prog-body">
                <span className="prog-badge">Bachelor of Science</span>
                <div className="prog-name">Entrepreneurship</div>
                <p className="prog-desc">test</p>
              </div>
              <div className="prog-footer">
                <span className="prog-years">4-Year Program</span>
              </div>
            </div>

            <div className="prog-card">
              <img src="" className="prog-img" alt="Accountancy" />
              <div className="prog-body">
                <span className="prog-badge">Diploma</span>
                <div className="prog-name">Information Technology</div>
                <p className="prog-desc">test</p>
              </div>
              <div className="prog-footer">
                <span className="prog-years">3-Year Program</span>
              </div>
            </div>

            <div className="prog-card">
              <img src="" className="prog-img" alt="Accountancy" />
              <div className="prog-body">
                <span className="prog-badge">Diploma</span>
                <div className="prog-name">DHRT</div>
                <p className="prog-desc">test</p>
              </div>
              <div className="prog-footer">
                <span className="prog-years">3-Year Program</span>
              </div>
            </div>
          </div>
          <div className="reveal" style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/register" className="btn-hero-primary" style={{ display: 'inline-block' }}>Join Us Today →</Link>
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
            <p className="footer-tagline">Forming Hearts. Shaping Futures. Serving the community through faith, learning, and excellence since 1952.</p>
            <div className="footer-contact" style={{ marginTop: '1.25rem' }}>
              <div>📍 123 Amatiel Drive, City, Philippines</div>
              <div>📞 (02) 8-123-4567</div>
              <div>✉️ admissions@csa.edu.ph</div>
            </div>
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
    </>
  )
}
