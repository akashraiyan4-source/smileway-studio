import React from 'react';
import Head from 'next/head';

export default function CosmeticPage() {
  return (
    <>
      <Head>
        <title>Beverly Hills Private Practice | Discreet Facial Architecture</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, interactive-widget=resizes-content" />
      </Head>

      {/* 0. Top Navigation & Centered Brand Logo */}
      <header className="site-nav">
        <a href="#" className="brand-logo">
          <div className="brand-monogram">A</div>
          <div className="brand-title">AURA • BEVERLY HILLS</div>
        </a>
      </header>

      {/* 1. HERO FLAGSHIP SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-pre-tag">• BEVERLY HILLS PRIVATE PRACTICE</div>
          
          <h1 className="hero-title">
            Discreet Deep-Plane<br />Facial Architecture
          </h1>
          
          <p className="hero-desc">
            Permanent structural SMAS repositioning designed for natural youthful harmony. Zero distortion, zero "windswept" tension, and 100% anonymous private suites for discerning individuals.
          </p>

          <div className="hero-pills">
            <div className="pill-item"><span>🔑</span> Anonymous Valet Entry</div>
            <div className="pill-item"><span>🛡️</span> Quad-A Surgical Theater</div>
            <div className="pill-item"><span>🩺</span> MD Anesthesiologist Only</div>
          </div>

          <div style={{ marginTop: '10px', width: '100%' }}>
            <a href="#candidate-section" className="gold-btn">Reserve VIP Consultation →</a>
          </div>
        </div>

        {/* Hero Video Slider Frame */}
        <div className="hero-video-wrapper">
          <div className="slider-frame" id="sliderWrapper">
            
            <div className="sound-toggle" id="soundBtn">
              <span id="soundIcon">🔇</span>
              <span id="soundText">Sound Off</span>
            </div>

            <div className="pane-video pane-left">
              <video id="beforeLoop" autoPlay muted loop playsInline preload="auto" poster="/niches/cosmetics/before-poster.jpg">
                <source src="/niches/cosmetics/cosmetic befor loop.mp4" type="video/mp4" />
              </video>
              <video id="beforeAction" className="pane-video action-layer" muted loop playsInline preload="auto" poster="/niches/cosmetics/before-poster.jpg">
                <source src="/niches/cosmetics/cosmetic before swap.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="pane-video pane-right" id="afterPane">
              <video id="afterLoop" autoPlay muted loop playsInline preload="auto" poster="/niches/cosmetics/after-poster.jpg">
                <source src="/niches/cosmetics/cosmetic after loop.mp4" type="video/mp4" />
              </video>
              <video id="afterAction" className="pane-video action-layer" muted loop playsInline preload="auto" poster="/niches/cosmetics/after-poster.jpg">
                <source src="/niches/cosmetics/cosmetic after swap.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="slider-divider-bar" id="dividerLine"></div>
            <div className="slider-knob" id="sliderKnob">
              <div className="knob-arrows">
                <span>&lsaquo;&rsaquo;</span>
              </div>
            </div>

            <div className="bottom-tags">
              <div className="b-tag">Pre-Treatment</div>
              <div className="b-tag">Post-Restoration</div>
            </div>

          </div>
          <div className="drag-hint">⟵ Drag Knob Left for Glow • Drag Right for Regret ⟶</div>
        </div>
      </section>

      {/* অতিরিক্ত সেকশনগুলো এবং স্ক্রিপ্ট লজিক একইভাবে এখানে থাকবে */}
    </>
  );
}