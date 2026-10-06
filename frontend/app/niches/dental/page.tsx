'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function DentalPage() {
  const [mounted, setMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [funnelStep, setFunnelStep] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Welcome to SmileWay Studio. How may I assist with your Beverly Hills aesthetic smile preview today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [showCalendarWidget, setShowCalendarWidget] = useState(false);
  const [chatSlot, setChatSlot] = useState('');
  const [chatSlotStatus, setChatSlotStatus] = useState({ text: '', color: '' });

  const vidStartRef = useRef<HTMLVideoElement>(null);
  const vidTransRef = useRef<HTMLVideoElement>(null);
  const vidEndRef = useRef<HTMLVideoElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const knobSvgRef = useRef<SVGSVGElement>(null);
  const reviewsInnerRef = useRef<HTMLDivElement>(null);
  const casesInnerRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const heroBoxRef = useRef<HTMLDivElement>(null);

  const [drawerName, setDrawerName] = useState('');
  const [drawerPhone, setDrawerPhone] = useState('');
  const [drawerTreatment, setDrawerTreatment] = useState('Handcrafted Porcelain Veneers');

  const [mainName, setMainName] = useState('');
  const [mainPhone, setMainPhone] = useState('');
  const [mainTreatment, setMainTreatment] = useState('dental');
  const [mainAppointmentDate, setMainAppointmentDate] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  };

  const unmutedSvg = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
  const mutedSvg = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;

  useEffect(() => {
    if (!mounted) return;

    const vidStart = vidStartRef.current;
    if (vidStart) {
      vidStart.muted = isMuted;
      vidStart.play().catch(() => {
        vidStart.muted = true;
        setIsMuted(true);
        vidStart.play().catch(() => {});
      });
    }

    initInertialMarquee('reviewsBox', reviewsInnerRef, 0.6);
    initInertialMarquee('casesBox', casesInnerRef, 0.5);

    const triggerButtons = document.querySelectorAll('.service-trigger-btn');
    triggerButtons.forEach(btn => {
      const handleClick = async (e: Event) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const topic = (e.currentTarget as HTMLElement).getAttribute('data-topic') || 'dental consultation';

        setIsChatOpen(true);
        const proactiveMsg = `Welcome to SmileWay Studio. Thank you for your interest in our luxury ${topic}. Our bespoke treatments are tailored to your exact facial harmony. Would you like me to guide you through the details or secure a confidential VIP consultation with Dr. Julian Vance?`;
        
        setChatMessages(prev => {
          if (prev[prev.length - 1]?.text === proactiveMsg) return prev;
          return [...prev, { sender: 'bot', text: proactiveMsg }];
        });
      };
      btn.addEventListener('click', handleClick, { capture: true });
    });

    const handleScrollMute = () => {
      const heroBox = heroBoxRef.current;
      if (!heroBox) return;
      const rect = heroBox.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const isMostlyOutOfView = visibleHeight < rect.height * 0.33;

      if (isMostlyOutOfView && !isMuted) {
        setIsMuted(true);
        if (vidStartRef.current) vidStartRef.current.muted = true;
        if (vidTransRef.current) vidTransRef.current.muted = true;
        if (vidEndRef.current) vidEndRef.current.muted = true;
      }
    };
    window.addEventListener('scroll', handleScrollMute, { passive: true });

    const observerOptions = { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(section => {
      observer.observe(section);
    });

    return () => {
      window.removeEventListener('scroll', handleScrollMute);
    };
  }, [isMuted, mounted]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages, showCalendarWidget]);

  if (!mounted) return null; // রিফ্রেশ গ্লিচ ও হাইড্রেশন সমস্যা রোধ করতে

  const toggleSound = () => {
    triggerHaptic(20);
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (vidStartRef.current) vidStartRef.current.muted = nextMuted;
    if (vidTransRef.current) vidTransRef.current.muted = nextMuted;
    if (vidEndRef.current) vidEndRef.current.muted = nextMuted;
  };

  const toggleFaq = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic(15);
    const item = e.currentTarget.closest('.faq-item');
    const isActive = item?.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
    if (!isActive && item) item.classList.add('active');
  };

  const handlePointerDownKnob = (e: React.PointerEvent<HTMLDivElement>) => {
    if (funnelStep === 1) return;
    triggerHaptic(25);
    const knob = knobRef.current;
    const track = trackRef.current;
    if (!knob || !track) return;

    let startX = e.clientX;
    const maxMove = track.clientWidth - knob.clientWidth - 8;
    knob.style.transition = 'none';

    try { knob.setPointerCapture(e.pointerId); } catch(err) {}

    const onPointerMove = (ev: PointerEvent) => {
      const currentX = ev.clientX;
      if (funnelStep === 0) {
        let delta = currentX - startX;
        let move = Math.max(0, Math.min(delta, maxMove));
        knob.style.transform = `translate3d(${move}px, -50%, 0)`;
      } else if (funnelStep === 2) {
        let delta = startX - currentX;
        let move = Math.max(0, Math.min(delta, maxMove));
        knob.style.transform = `translate3d(${maxMove - move}px, -50%, 0)`;
      }
    };

    const onPointerUp = (ev: PointerEvent) => {
      knob.removeEventListener('pointermove', onPointerMove);
      knob.removeEventListener('pointerup', onPointerUp);

      const st = window.getComputedStyle(knob);
      const tm = st.transform || st.webkitTransform;
      let currentTranslateX = 0;
      if (tm && tm !== 'none') {
        const values = tm.split(', ');
        if (values.length >= 6) currentTranslateX = parseFloat(values[4]);
      }

      if (funnelStep === 0) {
        if (currentTranslateX >= maxMove * 0.35) {
          executeForwardTransition(maxMove);
        } else {
          knob.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
          knob.style.transform = 'translate3d(0, -50%, 0)';
        }
      } else if (funnelStep === 2) {
        let pulledBackDistance = maxMove - currentTranslateX;
        if (pulledBackDistance >= maxMove * 0.35) {
          executeReverseCompletion();
        } else {
          knob.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
          knob.style.transform = `translate3d(${maxMove}px, -50%, 0)`;
        }
      }
      try { knob.releasePointerCapture(ev.pointerId); } catch(err) {}
    };

    knob.addEventListener('pointermove', onPointerMove);
    knob.addEventListener('pointerup', onPointerUp);
  };

  const executeForwardTransition = (maxMove: number) => {
    setFunnelStep(1);
    triggerHaptic(40);
    const knob = knobRef.current;
    if (knob) {
      knob.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      knob.style.transform = `translate3d(${maxMove}px, -50%, 0)`;
    }

    if (vidStartRef.current) {
      vidStartRef.current.pause();
      vidStartRef.current.muted = true;
      vidStartRef.current.style.opacity = '0';
    }

    if (vidTransRef.current) {
      vidTransRef.current.style.opacity = '1';
      vidTransRef.current.currentTime = 0;
      vidTransRef.current.muted = isMuted;
      vidTransRef.current.play().catch(() => {});

      vidTransRef.current.onended = () => {
        if (vidTransRef.current) {
          vidTransRef.current.pause();
          vidTransRef.current.muted = true;
          vidTransRef.current.style.opacity = '0';
        }
        if (vidEndRef.current) {
          vidEndRef.current.style.opacity = '1';
          vidEndRef.current.currentTime = 0;
          vidEndRef.current.muted = isMuted;
          vidEndRef.current.loop = true;
          vidEndRef.current.play().catch(() => {
            if (vidEndRef.current) {
              vidEndRef.current.muted = true;
              vidEndRef.current.play().catch(() => {});
            }
          });
        }
        setFunnelStep(2);
        if (knob) {
          knob.style.transition = 'none';
          knob.style.transform = `translate3d(${maxMove}px, -50%, 0)`;
        }
        if (knobSvgRef.current) knobSvgRef.current.style.transform = 'rotate(180deg)';
        if (trackRef.current) trackRef.current.classList.add('reverse');
      };
    }
  };

  const executeReverseCompletion = () => {
    setFunnelStep(3);
    triggerHaptic(50);
    const knob = knobRef.current;
    if (knob) {
      knob.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      knob.style.transform = 'translate3d(0, -50%, 0)';
    }
    setTimeout(() => { setIsDrawerOpen(true); }, 200);
  };

  const closeHeroDrawer = () => {
    setIsDrawerOpen(false);
    setFunnelStep(0);
    if (vidEndRef.current) {
      vidEndRef.current.pause();
      vidEndRef.current.muted = true;
      vidEndRef.current.style.opacity = '0';
    }
    if (vidTransRef.current) {
      vidTransRef.current.pause();
      vidTransRef.current.muted = true;
      vidTransRef.current.style.opacity = '0';
    }
    if (vidStartRef.current) {
      vidStartRef.current.style.opacity = '1';
      vidStartRef.current.currentTime = 0;
      vidStartRef.current.muted = isMuted;
      vidStartRef.current.play().catch(() => {});
    }
    if (trackRef.current) {
      trackRef.current.style.opacity = '1';
      trackRef.current.style.pointerEvents = 'auto';
      trackRef.current.classList.remove('reverse');
    }
    const knob = knobRef.current;
    if (knob) {
      knob.style.transition = 'none';
      knob.style.transform = 'translate3d(0, -50%, 0)';
    }
    if (knobSvgRef.current) knobSvgRef.current.style.transform = 'rotate(0deg)';
  };

  // ইউনিভার্সাল এপিআই ও মেটাডেটা কি (sourceNiche & landingPageId) সহ ড্রয়ার ফর্ম সাবমিশন
  const submitDrawerForm = async () => {
    if (!drawerName.trim() || !drawerPhone.trim()) {
      alert('Please fill in both your name and phone number.');
      return;
    }
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: drawerName, 
          phone: drawerPhone, 
          sourceNiche: 'dental', 
          landingPageId: 'dental-miami-01',
          appointmentDate: new Date(Date.now() + 86400000).toISOString(),
          triggers: ['leads', 'booking', 'whatsapp-integration', 'follow-up', 'lead-scoring', 'analytics']
        })
      });
      const result = await response.json();
      if (response.ok) {
        alert('Success! Priority appointment slot reserved and universal automations triggered.');
        closeHeroDrawer();
      } else {
        alert('Error: ' + (result.error || 'Something went wrong'));
      }
    } catch (err) {
      alert('Server connection failed.');
    }
  };

  // ইউনিভার্সাল এপিআই ও মেটাডেটা কি (sourceNiche & landingPageId) সহ মেইন ফর্ম সাবমিশন
  const submitMainForm = async () => {
    if (!mainName.trim() || !mainPhone.trim() || !mainAppointmentDate) {
      alert('Please fill in your name, phone number, and select a preferred consultation date.');
      return;
    }
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: mainName, 
          phone: mainPhone, 
          sourceNiche: 'dental', 
          landingPageId: 'dental-miami-01',
          service: mainTreatment, 
          appointmentDate: mainAppointmentDate,
          triggers: ['leads', 'booking', 'whatsapp-integration', 'follow-up', 'lead-scoring', 'sentiment-analyzer', 'analytics']
        })
      });
      const result = await response.json();
      if (response.ok) {
        alert('Priority Consultation Confirmed & Enterprise Automations Active!');
        setMainName(''); setMainPhone(''); setMainAppointmentDate('');
      } else {
        alert('Error: ' + (result.error || 'Booking could not be finalized'));
      }
    } catch (err) {
      alert('Server connection failed.');
    }
  };

  // এআই অ্যাসিস্ট্যান্ট চ্যাট হ্যান্ডলার (Gemini Concierge API)
  const sendAiMessage = async () => {
    if (!userInput.trim()) return;
    const text = userInput.trim();
    if (text.length > 300) {
      alert("Please keep your message under 300 characters.");
      return;
    }

    setChatMessages(prev => [...prev, { sender: 'user', text }]);
    setUserInput('');
    triggerHaptic(20);

    const bookingKeywords = ['book', 'appointment', 'consultation', 'slot', 'schedule', 'তারিখ', 'বুক'];
    const wantsBooking = bookingKeywords.some(keyword => text.toLowerCase().includes(keyword));

    try {
      const response = await fetch('/api/gemini-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          sourceNiche: 'dental', 
          landingPageId: 'dental-miami-01',
          brandName: "SmileWay Studio", 
          expertName: "Dr. Julian Vance" 
        })
      });
      const result = await response.json();
      const replyText = (result && result.reply) ? result.reply : "Hey there! Welcome to SmileWay Studio. How can I help you out today?";
      
      setChatMessages(prev => [...prev, { sender: 'bot', text: replyText }]);
      if (wantsBooking) {
        setTimeout(() => setShowCalendarWidget(true), 600);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: "Hey! Thanks for reaching out. Would you like me to grab a quick time slot for a chat?" }]);
    }
  };

  const confirmChatSlot = async () => {
    if (!chatSlot) {
      alert('Please pick a date and time slot.');
      return;
    }
    setChatSlotStatus({ text: 'Syncing appointment...', color: '#0071e3' });
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: 'Concierge Web Guest', 
          phone: '+15552347890', 
          sourceNiche: 'dental', 
          landingPageId: 'dental-miami-01',
          appointmentDate: chatSlot,
          triggers: ['leads', 'booking', 'whatsapp-integration', 'follow-up']
        })
      });
      const resData = await response.json();
      if (response.ok) {
        setChatSlotStatus({ text: '✓ VIP Slot Confirmed!', color: '#34c759' });
      } else {
        setChatSlotStatus({ text: 'Could not reserve slot.', color: '#dc2626' });
      }
    } catch (err) {
      setChatSlotStatus({ text: 'Connection error.', color: '#dc2626' });
    }
  };

  function initInertialMarquee(boxId: string, innerRef: React.RefObject<HTMLDivElement | null>, baseSpeed = 0.6) {
    const box = document.getElementById(boxId);
    const inner = innerRef.current;
    if (!box || !inner) return;

    let scrollX = 0;
    let velocity = baseSpeed;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastTime = Date.now();
    let isVerticalIntent = false;

    if (inner.children.length <= 6) {
      inner.innerHTML += inner.innerHTML;
    }
    const totalWidth = inner.scrollWidth / 2;

    const step = () => {
      if (!isDragging) {
        velocity = velocity * 0.95 + baseSpeed * 0.05;
        scrollX += velocity;
        if (scrollX >= totalWidth) scrollX -= totalWidth;
        else if (scrollX < 0) scrollX += totalWidth;
        inner.style.transform = `translate3d(${-scrollX}px, 0, 0)`;
      }
      requestAnimationFrame(step);
    };

    box.addEventListener('pointerdown', (e) => {
      isDragging = true;
      isVerticalIntent = false;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastTime = Date.now();
      box.style.cursor = 'grabbing';
      try { box.setPointerCapture(e.pointerId); } catch(err){}
    });

    box.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - startY;

      if (!isVerticalIntent && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
        isVerticalIntent = true;
        isDragging = false;
        box.style.cursor = 'grab';
        return;
      }

      if (isVerticalIntent) return;

      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) velocity = -dx * (16 / dt) * 0.8;
      scrollX -= dx;
      if (scrollX >= totalWidth) scrollX -= totalWidth;
      else if (scrollX < 0) scrollX += totalWidth;
      inner.style.transform = `translate3d(${-scrollX}px, 0, 0)`;
      lastX = e.clientX;
      lastTime = now;
    });

    const endDrag = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      box.style.cursor = 'grab';
      try { box.releasePointerCapture(e.pointerId); } catch(err){}
    };

    box.addEventListener('pointerup', endDrag);
    box.addEventListener('pointercancel', endDrag);
    requestAnimationFrame(step);
  }

  return (
    <div className="app-shell" style={{ position: 'relative', overflowX: 'hidden' }}>
      <div className="ambient-bg-container">
        <video className="ambient-bg-video" src="/niches/dental/start.mp4" autoPlay muted loop playsInline preload="auto"></video>
        <div className="ambient-bg-overlay"></div>
      </div>

      <style jsx global>{`
        :root {
          --page-cream: #F7F4EF;
          --card-pure-white: #ffffff;
          --apple-dark: #141316;
          --apple-gray: #5C5854;
          --apple-border: rgba(0, 113, 227, 0.12);
          --apple-blue: #0071e3;
          --card-bg: #ffffff;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent !important; user-select: none !important; }
        input, select, textarea, button { user-select: auto !important; }
        
        html, body {
          width: 100%;
          min-height: 100%;
          background: var(--page-cream);
          color: var(--apple-dark);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", sans-serif;
          overflow-x: hidden;
          touch-action: pan-y;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          letter-spacing: -0.02em;
        }

        h1, h2, h3, h4, h5, h6, .brand-title, .hero-main-title, .sec-heading {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif;
          letter-spacing: -0.035em;
        }
        
        .ambient-bg-container { position: fixed; inset: 0; width: 100vw; height: 100vh; overflow: hidden; z-index: -1; pointer-events: none; background-color: var(--page-cream); transform: translate3d(0,0,0); backface-visibility: hidden; }
        .ambient-bg-video { width: 100%; height: 100%; object-fit: cover; filter: blur(32px) brightness(1.05); transform: scale(1.1); opacity: 0.20; will-change: transform; }
        .ambient-bg-overlay { position: absolute; inset: 0; background: rgba(247, 244, 239, 0.90); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }

        .app-shell { width: 100%; max-width: 1400px; margin: 0 auto; min-height: 100vh; position: relative; z-index: 1; display: flex; flex-direction: column; will-change: transform; }
        
        header { position: sticky; top: 0; z-index: 100; background: rgba(247, 244, 239, 0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding: 22px 36px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--apple-border); }
        .brand-title { font-size: 1.5rem; font-weight: 800; color: var(--apple-dark); letter-spacing: -0.035em; }
        .brand-title span { color: var(--apple-blue); }
        .phone-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--card-pure-white); border: 1px solid var(--apple-border); padding: 10px 20px; border-radius: 999px; color: var(--apple-blue); font-size: 0.9rem; font-weight: 700; text-decoration: none; box-shadow: 0 4px 16px rgba(0, 113, 227, 0.05); transition: transform 0.2s ease; cursor: pointer; }
        .phone-badge:hover { transform: translateY(-2px); }
        .status-dot-green { width: 8px; height: 8px; border-radius: 50%; background: #34c759; box-shadow: 0 0 8px rgba(52, 199, 89, 0.8); }
        
        .rating-strip { padding: 14px 20px; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 0.88rem; font-weight: 700; color: var(--apple-gray); background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); border-bottom: 1px solid var(--apple-border); }
        .g-icon { font-weight: 800; color: #4285f4; }
        .stars { color: #ff9500; letter-spacing: 2px; }
        
        .press-trust-bar { padding: 16px 20px; background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(10px); border-bottom: 1px solid var(--apple-border); overflow: hidden; white-space: nowrap; position: relative; cursor: grab; }
        .press-trust-inner { display: inline-flex; align-items: center; gap: 40px; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #475569; }
        
        .celebrity-ticker-bar { padding: 14px 20px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); border-bottom: 1px solid var(--apple-border); overflow: hidden; white-space: nowrap; display: flex; align-items: center; }
        .celebrity-ticker-inner { display: inline-flex; align-items: center; gap: 36px; font-size: 0.78rem; font-weight: 700; color: #0071e3; animation: celebrityScroll 20s linear infinite; }
        @keyframes celebrityScroll { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(-50%, 0, 0); } }

        .hero-split-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 60px; align-items: center; padding: 70px 40px 90px 40px; max-width: 1360px; margin: 0 auto; width: 100%; }
        .hero-text-col { display: flex; flex-direction: column; gap: 24px; text-align: left; }
        .hero-tagline { font-size: 0.85rem; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: var(--apple-blue); }
        .hero-main-title { font-size: 4rem; font-weight: 900; line-height: 1.05; letter-spacing: -0.04em; color: var(--apple-dark); }
        .hero-main-title span, .highlight-text { color: var(--apple-blue); }
        .hero-sub-copy { font-size: 1.12rem; color: var(--apple-gray); line-height: 1.75; max-width: 580px; }
        
        .hero-pill-cluster { display: flex; flex-wrap: wrap; gap: 12px; margin: 10px 0; }
        .h-pill { display: inline-flex; align-items: center; gap: 8px; padding: 11px 22px; background: var(--card-bg); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1.5px solid var(--apple-border); border-radius: 8px; font-size: 0.82rem; font-weight: 700; color: var(--apple-dark); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04); transition: all 0.3s ease; cursor: pointer; }
        .h-pill:hover { transform: translateY(-3px); border-color: rgba(0, 113, 227, 0.4); background: rgba(0, 113, 227, 0.03); box-shadow: 0 10px 24px rgba(0, 113, 227, 0.12); }
        .h-pill span { color: var(--apple-blue); }
        
        .hero-cta-btn { display: inline-flex; align-items: center; justify-content: center; background: var(--apple-blue); color: #ffffff; padding: 19px 38px; border-radius: 8px; font-size: 1.05rem; font-weight: 700; text-decoration: none; box-shadow: 0 10px 25px rgba(0, 113, 227, 0.25); width: fit-content; cursor: pointer; transition: all 0.3s ease; }
        .hero-cta-btn:hover { transform: translateY(-3px); box-shadow: 0 14px 32px rgba(0, 113, 227, 0.35); background: #0077ed; }
        
        .hero-box { position: relative; width: 100%; max-width: 440px; margin: 0 auto; border-radius: 12px; overflow: hidden; aspect-ratio: 9 / 16; background: #0d131f; box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.25); border: 1px solid var(--apple-border); }
        .hero-vid { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; background-color: #0d131f; }
        
        .glass-sound-btn { position: absolute; top: 20px; right: 20px; z-index: 30; width: 44px; height: 44px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.5); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2); }
        .glass-sound-btn svg { width: 19px; height: 19px; fill: rgba(255, 255, 255, 0.98); }
        
        .swipe-interactive-zone { position: absolute; bottom: 155px; left: 20px; right: 20px; height: 90px; background: transparent !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; border: none !important; box-shadow: none !important; display: flex; align-items: center; padding: 0 6px; z-index: 25; touch-action: none; }
        .swipe-arrow-handle { height: 84px; width: 96px; background: transparent !important; border: none !important; box-shadow: none !important; display: flex; align-items: center;