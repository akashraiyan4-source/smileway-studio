'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function Page() {
  const [isMuted, setIsMuted] = useState(true);
  const [funnelStep, setFunnelStep] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your AI Assistant. How can I assist with your Beverly Hills aesthetic smile preview today?' }
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

  const [drawerName, setDrawerName] = useState('');
  const [drawerPhone, setDrawerPhone] = useState('');
  const [drawerTreatment, setDrawerTreatment] = useState('Handcrafted Porcelain Veneers');

  const [mainName, setMainName] = useState('');
  const [mainPhone, setMainPhone] = useState('');
  const [mainTreatment, setMainTreatment] = useState('dental');
  const [mainAppointmentDate, setMainAppointmentDate] = useState('');

  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  };

  const unmutedSvg = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
  const mutedSvg = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;

  useEffect(() => {
    const vidStart = vidStartRef.current;
    if (vidStart) {
      vidStart.muted = isMuted;
      vidStart.play().catch(() => {});
    }

    initInertialMarquee('reviewsBox', reviewsInnerRef, 0.6);
    initInertialMarquee('casesBox', casesInnerRef, 0.5);

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
  }, []);

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
    if (vidTransRef.current) vidTransRef.current.load();
    if (vidEndRef.current) vidEndRef.current.load();

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
        if (currentTranslateX >= maxMove * 0.5) {
          executeForwardTransition(maxMove);
        } else {
          knob.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
          knob.style.transform = 'translate3d(0, -50%, 0)';
        }
      } else if (funnelStep === 2) {
        let pulledBackDistance = maxMove - currentTranslateX;
        if (pulledBackDistance >= maxMove * 0.5) {
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
      vidStartRef.current.style.opacity = '0';
    }

    if (vidTransRef.current) {
      vidTransRef.current.style.opacity = '1';
      vidTransRef.current.currentTime = 0;
      vidTransRef.current.muted = isMuted;
      vidTransRef.current.play().catch(() => {});

      vidTransRef.current.onended = () => {
        if (vidTransRef.current) vidTransRef.current.style.opacity = '0';
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
      vidEndRef.current.style.opacity = '0';
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

  const submitDrawerForm = async () => {
    if (!drawerName.trim() || !drawerPhone.trim()) {
      alert('Please fill in both your name and phone number.');
      return;
    }
    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: drawerName, phone: drawerPhone, niche: 'dental', appointmentDate: new Date(Date.now() + 86400000).toISOString() })
      });
      const result = await response.json();
      if (result.success) {
        alert('Success! Priority appointment slot reserved. Dr. Vance’s team will text you within 60s.');
        closeHeroDrawer();
      } else {
        alert('Error: ' + (result.error || 'Something went wrong'));
      }
    } catch (err) {
      alert('Server connection failed.');
    }
  };

  const submitMainForm = async () => {
    if (!mainName.trim() || !mainPhone.trim() || !mainAppointmentDate) {
      alert('Please fill in your name, phone number, and select a preferred consultation date.');
      return;
    }
    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: mainName, phone: mainPhone, niche: mainTreatment, appointmentDate: mainAppointmentDate })
      });
      const result = await response.json();
      if (result.success) {
        alert('Priority Consultation Confirmed! 6-Month VIP Recall Engine tracking initialized.');
        setMainName(''); setMainPhone(''); setMainAppointmentDate('');
      } else {
        alert('Error: ' + (result.error || 'Booking could not be finalized'));
      }
    } catch (err) {
      alert('Server connection failed.');
    }
  };

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
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, userPhone: "WebVisitor" })
      });
      const result = await response.json();
      const replyText = result.success ? result.reply : "Thank you! Dr. Vance's team will contact you shortly regarding priority consultation.";
      
      setChatMessages(prev => [...prev, { sender: 'bot', text: replyText }]);
      if (wantsBooking) {
        setTimeout(() => setShowCalendarWidget(true), 600);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: "Thank you! Dr. Vance's team will contact you shortly regarding priority consultation." }]);
    }
  };

  const confirmChatSlot = async () => {
    if (!chatSlot) {
      alert('Please pick a date and time slot.');
      return;
    }
    setChatSlotStatus({ text: 'Syncing appointment with Dr. Vance...', color: '#0071e3' });
    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Concierge Web Guest', phone: '+15552347890', niche: 'dental', appointmentDate: chatSlot })
      });
      const resData = await response.json();
      if (resData.success) {
        setChatSlotStatus({ text: '✓ VIP Slot Confirmed! Concierge text sent.', color: '#34c759' });
      } else {
        setChatSlotStatus({ text: 'Could not reserve slot. Please try again.', color: '#dc2626' });
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
    let lastX = 0;
    let lastTime = Date.now();

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
      startX = e.clientX;
      lastX = e.clientX;
      lastTime = Date.now();
      box.style.cursor = 'grabbing';
      try { box.setPointerCapture(e.pointerId); } catch(err){}
    });

    box.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const now = Date.now();
      const dt = now - lastTime;
      const dx = e.clientX - lastX;
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
    <div className="app-shell">
      <style jsx global>{`
        :root {
          --apple-titanium: #eaedf2;
          --card-pure-white: #ffffff;
          --apple-dark: #111827;
          --apple-gray: #64748b;
          --apple-border: rgba(0, 0, 0, 0.06);
          --apple-blue: #0071e3;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent !important; user-select: none !important; }
        input, select, textarea, button { user-select: auto !important; }
        html, body { width: 100%; min-height: 100%; background: var(--apple-titanium); color: var(--apple-dark); font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif; overflow-x: hidden; touch-action: pan-y; -webkit-font-smoothing: antialiased; letter-spacing: -0.015em; }
        .app-shell { width: 100%; max-width: 1280px; margin: 0 auto; background: var(--apple-titanium); min-height: 100vh; position: relative; z-index: 1; display: flex; flex-direction: column; will-change: transform; }
        header { position: sticky; top: 0; z-index: 100; background: rgba(234, 237, 242, 0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--apple-border); }
        .brand-title { font-size: 1.25rem; font-weight: 800; color: var(--apple-dark); letter-spacing: -0.035em; }
        .brand-title span { color: var(--apple-blue); }
        .phone-badge { display: inline-flex; align-items: center; gap: 7px; background: var(--card-pure-white); border: 1px solid var(--apple-border); padding: 8px 16px; border-radius: 6px; color: var(--apple-blue); font-size: 0.82rem; font-weight: 600; text-decoration: none; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03); transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform; }
        .phone-badge:hover { transform: translateY(-2px); }
        .status-dot-green { width: 7px; height: 7px; border-radius: 50%; background: #34c759; box-shadow: 0 0 6px rgba(52, 199, 89, 0.6); }
        .rating-strip { padding: 12px 18px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.8rem; font-weight: 600; color: var(--apple-gray); background: var(--card-pure-white); border-bottom: 1px solid var(--apple-border); }
        .g-icon { font-weight: 800; color: #4285f4; }
        .stars { color: #ff9500; letter-spacing: 2px; }
        .press-trust-bar { padding: 12px 16px; background: rgba(255, 255, 255, 0.7); border-bottom: 1px solid var(--apple-border); overflow: hidden; white-space: nowrap; position: relative; cursor: grab; touch-action: pan-x; }
        .press-trust-inner { display: inline-flex; align-items: center; gap: 32px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #475569; will-change: transform; }
        .hero-split-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 48px; align-items: center; padding: 48px 32px 64px 32px; max-width: 1240px; margin: 0 auto; width: 100%; }
        .hero-text-col { display: flex; flex-direction: column; gap: 18px; text-align: left; }
        .hero-tagline { font-size: 0.78rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--apple-blue); }
        .hero-main-title { font-size: 3.4rem; font-weight: 900; line-height: 1.08; letter-spacing: -0.04em; color: var(--apple-dark); }
        .hero-sub-copy { font-size: 1.02rem; color: var(--apple-gray); line-height: 1.65; max-width: 520px; }
        .hero-pill-cluster { display: flex; flex-wrap: wrap; gap: 10px; margin: 6px 0; }
        .h-pill { display: inline-flex; align-items: center; gap: 8px; padding: 9px 18px; background: var(--card-pure-white); border: 1px solid var(--apple-border); border-radius: 6px; font-size: 0.76rem; font-weight: 700; color: var(--apple-dark); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03); transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform; }
        .h-pill:hover { transform: translateY(-2px); }
        .h-pill span { color: var(--apple-blue); }
        .hero-cta-btn { display: inline-flex; align-items: center; justify-content: center; background: var(--apple-blue); color: #ffffff; padding: 16px 32px; border-radius: 6px; font-size: 0.94rem; font-weight: 700; text-decoration: none; box-shadow: 0 8px 24px rgba(0, 113, 227, 0.35); width: fit-content; transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform; }
        .hero-cta-btn:hover { transform: scale(1.02); }
        .hero-box { position: relative; width: 100%; max-width: 380px; margin: 0 auto; border-radius: 12px; overflow: hidden; aspect-ratio: 9 / 16; background: #0d131f; box-shadow: 0 24px 60px -10px rgba(0, 0, 0, 0.25); border: 1px solid var(--apple-border); will-change: transform; }
        .hero-vid { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; will-change: opacity, transform; background-color: #0d131f; }
        .glass-sound-btn { position: absolute; top: 16px; right: 16px; z-index: 30; width: 38px; height: 38px; border-radius: 50%; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.4); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); transition: transform 0.2s; will-change: transform; }
        .glass-sound-btn:hover { transform: scale(1.1); }
        .glass-sound-btn svg { width: 17px; height: 17px; fill: rgba(255, 255, 255, 0.95); }
        .swipe-interactive-zone { position: absolute; bottom: 24px; left: 20px; right: 20px; height: 48px; background: rgba(0, 0, 0, 0.25) !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; backdrop-filter: blur(12px); border-radius: 6px; display: flex; align-items: center; padding: 0 4px; z-index: 20; touch-action: none; transition: opacity 0.3s ease; will-change: transform; }
        .swipe-arrow-handle { height: 40px; width: 52px; background: rgba(255, 255, 255, 0.92); border: 1px solid #ffffff; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: grab; position: absolute; left: 4px; top: 50%; transform: translate3d(0, -50%, 0); z-index: 25; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25); will-change: transform; }
        .swipe-arrow-handle svg { width: 18px; height: 18px; fill: var(--apple-blue); transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); pointer-events: none; }
        .half-form-drawer { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(24px); border-radius: 12px 12px 0 0; box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.18); z-index: 40; display: flex; flex-direction: column; padding: 24px 20px; transform: translate3d(0, 100%, 0); transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1); border-top: 1px solid var(--apple-border); will-change: transform; }
        .half-form-drawer.open { transform: translate3d(0, 0, 0); }
        .drawer-header { text-align: center; margin-bottom: 14px; padding-right: 20px; }
        .drawer-title { color: var(--apple-dark); font-size: 1.15rem; font-weight: 800; }
        .drawer-sub { color: var(--apple-gray); font-size: 0.76rem; margin-top: 3px; }
        .drawer-input { width: 100%; background: var(--apple-titanium); border: 1px solid var(--apple-border); padding: 12px 14px; border-radius: 6px; font-size: 0.88rem; color: var(--apple-dark); margin-bottom: 10px; outline: none; font-family: inherit; will-change: transform; }
        .drawer-btn { width: 100%; background: var(--apple-blue); border: none; padding: 13px; border-radius: 6px; color: #ffffff; font-size: 0.92rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: transform 0.2s; will-change: transform; }
        .drawer-btn:hover { transform: scale(1.01); }
        .drawer-dismiss { position: absolute; top: 16px; right: 16px; background: var(--apple-titanium); border: none; width: 28px; height: 28px; border-radius: 50%; color: var(--apple-gray); font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .animate-on-scroll { opacity: 0; transform: translateY(24px); transition: opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1); will-change: opacity, transform; }
        .animate-on-scroll.is-visible { opacity: 1; transform: translateY(0); }
        .content-container { max-width: 860px; margin: 0 auto; width: 100%; will-change: transform; }
        .section-padding { padding: 44px 24px; }
        .section-top-tight { padding-top: 10px; }
        .sec-tag { font-size: 0.76rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--apple-blue); margin-bottom: 8px; }
        .sec-heading { font-size: 1.85rem; font-weight: 800; color: var(--apple-dark); letter-spacing: -0.035em; line-height: 1.2; margin-bottom: 22px; }
        .doctor-card { position: relative; border-radius: 8px; overflow: hidden; margin-bottom: 22px; background: var(--card-pure-white); border: 1px solid var(--apple-border); box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04); will-change: transform; }
        .doc-img { width: 100%; height: 380px; object-fit: cover; object-position: top center; display: block; }
        .doc-tag { position: absolute; top: 16px; right: 16px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); padding: 7px 16px; border-radius: 6px; font-size: 0.74rem; font-weight: 700; color: var(--apple-blue); }
        .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 22px; }
        .stat-pill { background: var(--card-pure-white); border: 1px solid var(--apple-border); border-radius: 8px; padding: 18px 14px; text-align: center; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.03); transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform; }
        .stat-pill:hover { transform: translateY(-3px); }
        .stat-num { font-size: 1.6rem; font-weight: 800; color: var(--apple-dark); margin-bottom: 3px; }
        .stat-label { font-size: 0.78rem; font-weight: 500; color: var(--apple-gray); }
        .accreditation-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; justify-content: center; }
        .acc-badge { background: var(--card-pure-white); border: 1px solid var(--apple-border); color: var(--apple-dark); font-size: 0.76rem; font-weight: 600; padding: 8px 18px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; will-change: transform; }
        .infinite-marquee-box { width: 100%; overflow: hidden; position: relative; margin: 8px 0 16px 0; cursor: grab; touch-action: pan-x; mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent); will-change: transform; }
        .infinite-marquee-inner { display: flex; gap: 18px; width: max-content; will-change: transform; }
        .review-bubble { width: 290px; flex-shrink: 0; background: var(--card-pure-white); border: 1px solid var(--apple-border); border-radius: 8px; padding: 20px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04); will-change: transform; }
        .rev-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .rev-name { font-size: 0.88rem; font-weight: 700; color: var(--apple-dark); }
        .rev-quote { font-size: 0.84rem; line-height: 1.55; color: var(--apple-gray); }
        .interactive-cases-box { width: 100%; overflow: hidden; position: relative; margin: 8px 0 16px 0; cursor: grab; touch-action: pan-x; mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent); will-change: transform; }
        .interactive-cases-inner { display: flex; gap: 18px; width: max-content; will-change: transform; }
        .case-card-stream { width: 260px; flex-shrink: 0; background: var(--card-pure-white); border: 1px solid var(--apple-border); border-radius: 8px; padding: 14px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04); will-change: transform; }
        .case-photo-slot { position: relative; border-radius: 6px; overflow: hidden; height: 190px; margin-bottom: 10px; background: #e2e5e9; }
        .case-photo-slot img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .faq-list { display: flex; flex-direction: column; gap: 12px; }
        .faq-item { background: var(--card-pure-white); border: 1px solid var(--apple-border); border-radius: 8px; overflow: hidden; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.03); will-change: transform; }
        .faq-question { width: 100%; padding: 18px 20px; background: transparent; border: none; outline: none; display: flex; justify-content: space-between; align-items: center; font-size: 0.92rem; font-weight: 600; color: var(--apple-dark); text-align: left; cursor: pointer; font-family: inherit; }
        .faq-chevron { font-size: 1.2rem; color: var(--apple-gray); transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform; }
        .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s cubic-bezier(0.25, 1, 0.5, 1), padding 0.3s ease; padding: 0 20px; font-size: 0.85rem; color: var(--apple-gray); line-height: 1.55; }
        .faq-item.active .faq-answer { max-height: 160px; padding-bottom: 18px; }
        .faq-item.active .faq-chevron { transform: rotate(45deg); color: var(--apple-blue); }
        .consult-card { background: var(--card-pure-white); border: 1px solid var(--apple-border); border-radius: 10px; padding: 28px 24px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.05); margin-bottom: 26px; will-change: transform; }
        .slots-pill { display: inline-flex; align-items: center; gap: 7px; background: #fff8eb; border: 1px solid #ffe2b3; padding: 6px 14px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; color: #b25e00; margin-bottom: 16px; }
        .slots-dot { width: 6px; height: 6px; border-radius: 50%; background: #ff9500; }
        .guarantee-strip { display: flex; flex-direction: column; gap: 7px; background: #f2faf4; border: 1px solid #d1edd8; border-radius: 6px; padding: 14px 16px; margin-bottom: 18px; font-size: 0.78rem; font-weight: 600; color: #248a3d; }
        .form-input { width: 100%; background: var(--apple-titanium); border: 1px solid var(--apple-border); padding: 14px 16px; border-radius: 6px; font-size: 0.92rem; color: var(--apple-dark); margin-bottom: 12px; outline: none; font-family: inherit; will-change: transform; }
        .btn-confirm { width: 100%; background: var(--apple-blue); border: none; padding: 15px; border-radius: 6px; color: #ffffff; font-size: 0.96rem; font-weight: 600; cursor: pointer; font-family: inherit; box-shadow: 0 4px 16px rgba(0, 113, 227, 0.3); transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform; }
        .btn-confirm:hover { transform: scale(1.01); }
        
        .map-preview-card { position: relative; border-radius: 10px; overflow: hidden; border: 1px solid var(--apple-border); margin-bottom: 40px; box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08); background: #ffffff; display: flex; flex-direction: column; will-change: transform; }
        .map-preview-iframe-container { position: relative; width: 100%; height: 340px; background: #e5e3df; }
        .map-preview-iframe-container iframe { width: 100%; height: 100%; border: 0; display: block; }
        .map-floating-badge { position: absolute; top: 16px; left: 16px; background: #ffffff; border-radius: 6px; padding: 12px 16px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); display: flex; align-items: center; justify-content: space-between; gap: 16px; max-width: 320px; width: calc(100% - 32px); z-index: 10; border: 1px solid rgba(0,0,0,0.06); will-change: transform; }
        .map-badge-title { font-size: 0.85rem; font-weight: 800; color: var(--apple-dark); line-height: 1.2; }
        .map-badge-sub { font-size: 0.72rem; color: var(--apple-gray); margin-top: 2px; }
        .map-badge-icons { display: flex; gap: 8px; align-items: center; }
        .map-icon-btn { width: 32px; height: 32px; border-radius: 6px; background: #f0f4fd; border: 1px solid rgba(0, 113, 227, 0.2); display: flex; align-items: center; justify-content: center; color: var(--apple-blue); text-decoration: none; font-size: 0.9rem; transition: background 0.2s; will-change: transform; }
        .map-icon-btn:hover { background: #e2ecfc; }

        .floating-ai { position: fixed !important; bottom: 20px !important; right: 20px !important; z-index: 999999 !important; background: rgba(255, 255, 255, 0.95); border: 1.5px solid rgba(0, 113, 227, 0.35); width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 22px rgba(0, 0, 0, 0.16); backdrop-filter: blur(14px); cursor: pointer; transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform; }
        .floating-ai:hover { transform: scale(1.1); }
        .ai-avatar { font-size: 1.45rem; line-height: 1; }
        .status-dot-tiny { width: 9px; height: 9px; border-radius: 50%; background: #34c759; position: absolute; top: 3px; right: 3px; border: 2px solid #ffffff; }
        .ai-chat-modal { position: fixed !important; bottom: 78px !important; right: 20px !important; width: 380px !important; max-width: calc(100vw - 32px) !important; height: 520px !important; max-height: calc(100vh - 100px) !important; z-index: 999998 !important; display: flex !important; flex-direction: column !important; opacity: 0; pointer-events: none; transform: translateY(14px) scale(0.96); transition: opacity 0.22s ease, transform 0.22s ease; will-change: transform, opacity; }
        .ai-chat-modal.active { opacity: 1 !important; pointer-events: auto !important; transform: translateY(0) scale(1) !important; }
        .ai-chat-window { background: #ffffff; width: 100%; height: 100%; border-radius: 10px; display: flex; flex-direction: column; box-shadow: 0 16px 44px -8px rgba(0, 0, 0, 0.24); border: 1px solid var(--apple-border); overflow: hidden; will-change: transform; }
        .ai-chat-header { padding: 16px 20px; background: #ffffff; border-bottom: 1px solid var(--apple-border); display: flex; align-items: center; justify-content: space-between; }
        .ai-chat-body { flex: 1; padding: 18px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: var(--apple-titanium); }
        .ai-msg { max-width: 84%; padding: 11px 16px; border-radius: 8px; font-size: 0.85rem; line-height: 1.45; will-change: transform; }
        .ai-bot { background: #ffffff; color: var(--apple-dark); align-self: flex-start; border: 1px solid var(--apple-border); }
        .ai-user { background: var(--apple-blue); color: #ffffff; align-self: flex-end; }
        .ai-chat-footer { padding: 12px 18px; border-top: 1px solid var(--apple-border); display: flex; gap: 10px; background: #ffffff; }
        .ai-chat-input { flex: 1; border: 1px solid var(--apple-border); background: var(--apple-titanium); border-radius: 6px; padding: 10px 16px; font-size: 0.86rem; outline: none; font-family: inherit; will-change: transform; }
        .ai-send-btn { background: var(--apple-blue); color: #ffffff; border: none; padding: 8px 18px; border-radius: 6px; font-size: 0.84rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; will-change: transform; }
        .ai-send-btn:hover { transform: scale(1.02); }
        .chat-calendar-card { align-self: flex-start; width: 90%; background: #ffffff; border: 1.5px solid #0071e3; border-radius: 8px; padding: 14px; box-shadow: 0 8px 24px rgba(0, 113, 227, 0.12); will-change: transform; }
        .chat-calendar-title { font-size: 0.85rem; font-weight: 700; color: #0071e3; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .chat-calendar-input { width: 100%; background: var(--apple-titanium); border: 1px solid var(--apple-border); padding: 9px 12px; border-radius: 6px; font-size: 0.82rem; color: var(--apple-dark); margin-bottom: 10px; outline: none; }
        .chat-calendar-btn { width: 100%; background: #0071e3; color: #fff; border: none; padding: 10px; border-radius: 6px; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
        footer { padding: 30px 20px 90px 20px; text-align: center; font-size: 0.76rem; color: var(--apple-gray); border-top: 1px solid var(--apple-border); background: var(--card-pure-white); }
        @media (max-width: 768px) {
          header { padding: 14px 18px; justify-content: center !important; }
          .brand-title { font-size: 1.15rem; text-align: center; }
          .phone-badge { display: none; }
          .rating-strip { font-size: 0.75rem; padding: 10px 14px; text-align: center; }
          .hero-split-grid { grid-template-columns: 1fr; padding: 0 0 34px 0 !important; gap: 22px; text-align: center; }
          .hero-box { order: -1; width: 100vw !important; max-width: 100% !important; height: 75vh !important; aspect-ratio: auto !important; margin: 0 !important; border-radius: 0 0 10px 10px !important; }
          .hero-text-col { padding: 0 20px !important; align-items: center; text-align: center; gap: 14px; }
          .hero-main-title { font-size: 2.2rem !important; line-height: 1.12 !important; }
          .ai-chat-modal { bottom: 68px !important; right: 12px !important; left: 12px !important; width: calc(100vw - 24px) !important; height: min(520px, 75vh) !important; }
        }
      `}</style>

      <header>
        <div className="brand-title">SmileWay<span>Studio</span></div>
        <a href="tel:5552347890" className="phone-badge">
          <span className="status-dot-green"></span>
          <span>(555) 234-7890</span>
        </a>
      </header>

      <div className="rating-strip">
        <span className="g-icon">G</span>
        <span className="stars">★★★★★</span>
        <span>4.9 Rating (380+ Verified Beverly Hills Reviews)</span>
      </div>

      <div className="press-trust-bar">
        <div className="press-trust-inner">
          <span>Vogue</span> • <span>Beverly Hills Living</span> • <span>LA Times</span> • <span>Forbes</span> • 
          <span>Vogue</span> • <span>Beverly Hills Living</span> • <span>LA Times</span> • <span>Forbes</span>
        </div>
      </div>

      <section className="hero-split-grid">
        <div className="hero-text-col">
          <div className="hero-tagline">• BEVERLY HILLS AESTHETIC DENTISTRY</div>
          <h1 className="hero-main-title">Architectural Smile Design & Porcelain Art</h1>
          <p className="hero-sub-copy">
            Zero-pain bio-enamel restoration and bespoke ultra-thin veneers designed for natural radiance. Zero invasive grinding, 100% harmonious bite alignment, and private VIP treatment suites.
          </p>
          <div className="hero-pill-cluster">
            <div className="h-pill"><span>✨</span> Zero-Prep Micro Veneers</div>
            <div className="h-pill"><span>🛡️</span> 10-Year Structural Warranty</div>
            <div className="h-pill"><span>⏱️</span> 48-Hour Digital Smile Preview</div>
          </div>
          <div style={{ marginTop: '10px', width: '100%', display: 'flex' }}>
            <a href="#consultation-area" className="hero-cta-btn">Reserve Priority Smile Triage →</a>
          </div>
        </div>

        <div className="hero-box" id="heroSec" ref={trackRef}>
          <video ref={vidStartRef} className="hero-vid" src="/start.mp4" poster="/start-poster.jpg" playsInline preload="auto" loop muted autoPlay style={{ zIndex: 1, opacity: 1 }}></video>
          <video ref={vidTransRef} className="hero-vid" src="/trans.mp4" playsInline preload="none" muted style={{ zIndex: 2, opacity: 0, pointerEvents: 'none' }}></video>
          <video ref={vidEndRef} className="hero-vid" src="/end.mp4" playsInline preload="none" loop muted style={{ zIndex: 3, opacity: 0, pointerEvents: 'none' }}></video>

          <button className="glass-sound-btn" onClick={toggleSound} aria-label="Toggle Sound">
            <svg dangerouslySetInnerHTML={{ __html: isMuted ? mutedSvg : unmutedSvg }} viewBox="0 0 24 24" />
          </button>

          <div className="swipe-interactive-zone" id="swipeTrack">
            <div className="swipe-arrow-handle" id="swipeKnob" ref={knobRef} onPointerDown={handlePointerDownKnob}>
              <svg ref={knobSvgRef} viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </div>
          </div>

          <div className={`half-form-drawer ${isDrawerOpen ? 'open' : ''}`} id="heroDrawer">
            <button className="drawer-dismiss" onClick={closeHeroDrawer}>×</button>
            <div className="drawer-header">
              <h3 className="drawer-title">Claim Your Radiance</h3>
              <p className="drawer-sub">Direct senior cosmetic triage confirmed via backend.</p>
            </div>
            <input type="text" value={drawerName} onChange={e => setDrawerName(e.target.value)} className="drawer-input" placeholder="Your Full Name" />
            <input type="tel" value={drawerPhone} onChange={e => setDrawerPhone(e.target.value)} className="drawer-input" placeholder="Direct Phone (SMS Enabled)" />
            <select value={drawerTreatment} onChange={e => setDrawerTreatment(e.target.value)} className="drawer-input">
              <option value="Handcrafted Porcelain Veneers">Handcrafted Porcelain Veneers</option>
              <option value="Micro-Enamel Bio-Seal">Micro-Enamel Bio-Seal</option>
              <option value="Full Arch Smile Alignment">Full Arch Smile Alignment</option>
            </select>
            <button className="drawer-btn" onClick={submitDrawerForm}>Confirm Priority Slot</button>
          </div>
        </div>
      </section>

      <div className="content-container">
        <section className="section-padding section-top-tight animate-on-scroll">
          <div className="doctor-card">
            <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80" alt="Dr Julian Vance" className="doc-img" />
            <div className="doc-tag">★ Chief Cosmetic Dentist</div>
          </div>
          <div className="sec-tag">Oral Restoration Authority</div>
          <h2 className="sec-heading">Dr. Julian Vance, DDS</h2>
          <p style={{ fontSize: '0.94rem', color: 'var(--apple-gray)', lineHeight: '1.65' }}>
            Specializing in zero-pain bio-enamel restoration and handcrafted porcelain veneers. Delivering transformative bite alignment and natural aesthetic radiance for high-profile smiles.
          </p>
          <div className="stats-row">
            <div className="stat-pill">
              <div className="stat-num">12,400+</div>
              <div className="stat-label">Cases Handled</div>
            </div>
            <div className="stat-pill">
              <div className="stat-num">99.8%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
          <div className="accreditation-row">
            <span className="acc-badge">✓ AACD Accredited</span>
            <span className="acc-badge">✓ ADA Member</span>
            <span className="acc-badge">★ Top Doctor 2026</span>
            <span className="acc-badge">✦ Invisalign Diamond</span>
          </div>
        </section>

        <section className="section-padding animate-on-scroll" style={{ paddingTop: 0 }}>
          <div className="sec-tag">Real Experiences</div>
          <h2 className="sec-heading">Google Patient Reviews</h2>
          <div className="infinite-marquee-box" id="reviewsBox">
            <div className="infinite-marquee-inner" ref={reviewsInnerRef}>
              <div className="review-bubble">
                <div className="rev-head"><span className="rev-name">Elena R. <span style={{color:'var(--apple-blue)'}}>✓ Verified</span></span><span style={{color:'#ff9500', fontSize: '0.75rem'}}>★★★★★</span></div>
                <p className="rev-quote">"Got my veneers done here. 100% pain-free and natural white. Transformed my self-confidence completely!"</p>
              </div>
              <div className="review-bubble">
                <div className="rev-head"><span className="rev-name">Marcus T. <span style={{color:'var(--apple-blue)'}}>✓ Verified</span></span><span style={{color:'#ff9500', fontSize: '0.75rem'}}>★★★★★</span></div>
                <p className="rev-quote">"Dr. Vance is an absolute artist. Same-day triage and the precision mapping blew my mind."</p>
              </div>
              <div className="review-bubble">
                <div className="rev-head"><span className="rev-name">Sophia L. <span style={{color:'var(--apple-blue)'}}>✓ Verified</span></span><span style={{color:'#ff9500', fontSize: '0.75rem'}}>★★★★★</span></div>
                <p className="rev-quote">"World-class private clinic experience. Zero dentin sensitivity and an effortless radiant smile."</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding animate-on-scroll" style={{ paddingTop: 0 }}>
          <div className="sec-tag">Proven Results</div>
          <h2 className="sec-heading">Clinical Transformations</h2>
          <div className="interactive-cases-box" id="casesBox">
            <div className="interactive-cases-inner" ref={casesInnerRef}>
              <div className="case-card-stream">
                <div className="case-photo-slot"><img src="/images (3).jfif" alt="Transform" /></div>
                <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>Case #481: Micro-Thin Veneers</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--apple-gray)' }}>Shade BL1 • Zero-Prep Restoration</p>
              </div>
              <div className="case-card-stream">
                <div className="case-photo-slot"><img src="/images (2).jfif" alt="Transform" /></div>
                <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>Case #512: Full Arch Symmetry</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--apple-gray)' }}>Bite Balancing • Handcrafted Ceramic</p>
              </div>
              <div className="case-card-stream">
                <div className="case-photo-slot"><img src="/images (1).jfif" alt="Transform" /></div>
                <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>Case #604: Precision Bio-Implant</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--apple-gray)' }}>Immediate Load • Seamless Gum Blend</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding animate-on-scroll" style={{ paddingTop: 0 }}>
          <div className="sec-tag">Patient Guidance</div>
          <h2 className="sec-heading">Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <button className="faq-question" onClick={toggleFaq}><span>Is the porcelain veneer procedure painful?</span><span className="faq-chevron">+</span></button>
              <div className="faq-answer"><p>Zero discomfort. We utilize gentle micro-sedation and localized numbing protocols.</p></div>
            </div>
            <div className="faq-item">
              <button className="faq-question" onClick={toggleFaq}><span>How long do bespoke veneers last?</span><span className="faq-chevron">+</span></button>
              <div className="faq-answer"><p>Our handcrafted veneers typically endure 15 to 20+ years with routine oral hygiene.</p></div>
            </div>
          </div>
        </section>

        <section className="section-padding animate-on-scroll" id="consultation-area" style={{ paddingTop: 0 }}>
          <div className="consult-card">
            <div className="slots-pill"><span className="slots-dot"></span><span>Only 3 Priority Triage Slots Left This Week</span></div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>Reserve Your Consultation</h3>
            <div className="guarantee-strip">
              <div>🛡️ 10-Year Comprehensive Structural Warranty</div>
              <div>🔒 100% Private VIP Suite & Rear Valet Access</div>
              <div>💳 0% APR Flexible Monthly Installments Available</div>
            </div>
            <input type="text" value={mainName} onChange={e => setMainName(e.target.value)} className="form-input" placeholder="Your Full Name" />
            <input type="tel" value={mainPhone} onChange={e => setMainPhone(e.target.value)} className="form-input" placeholder="Mobile Phone (SMS Enabled)" />
            <select value={mainTreatment} onChange={e => setMainTreatment(e.target.value)} className="form-input">
              <option value="dental">Handcrafted Porcelain Veneers</option>
              <option value="cosmetic">Micro-Enamel Bio-Seal</option>
              <option value="roofing">Full Arch Smile Alignment</option>
            </select>
            <input type="datetime-local" value={mainAppointmentDate} onChange={e => setMainAppointmentDate(e.target.value)} className="form-input" />
            <button className="btn-confirm" onClick={submitMainForm}>Confirm Priority Appointment</button>
          </div>

          <div className="map-preview-card">
            <div className="map-floating-badge">
              <div>
                <div className="map-badge-title">9400 Wilshire Blvd</div>
                <div className="map-badge-sub">9400 Wilshire Blvd, Beverly Hills, CA 90212, USA</div>
              </div>
              <div className="map-badge-icons">
                <a href="https://maps.google.com/?q=9400+Wilshire+Blvd+Beverly+Hills+CA+90212" target="_blank" rel="noreferrer" className="map-icon-btn" title="Open Map">↗</a>
                <a href="https://maps.google.com/?q=9400+Wilshire+Blvd+Beverly+Hills+CA+90212" target="_blank" rel="noreferrer" className="map-icon-btn" title="Get Directions">➔</a>
              </div>
            </div>
            <div className="map-preview-iframe-container">
              <iframe
                title="SmileWay Studio Map Location"
                src="https://maps.google.com/maps?q=9400%20Wilshire%20Blvd,%20Beverly%20Hills,%20CA%2090212&t=&z=15&ie=UTF8&iwloc=&output=embed"
                loading="lazy"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      </div>

      <footer>
        <p>© 2026 SmileWay Private Dental Studio. All Rights Reserved.</p>
      </footer>

      <div className="floating-ai" onClick={() => setIsChatOpen(!isChatOpen)} aria-label="Toggle AI Assistant">
        <span className="ai-avatar">🤖</span>
        <span className="status-dot-tiny"></span>
      </div>

      <div className={`ai-chat-modal ${isChatOpen ? 'active' : ''}`}>
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#34c759'}}></div>
              <strong>SmileWay AI Assistant</strong>
            </div>
            <button onClick={() => setIsChatOpen(false)} style={{background:'none', border:'none', fontSize:'1.4rem', cursor:'pointer'}}>×</button>
          </div>
          <div className="ai-chat-body" ref={chatBodyRef}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`ai-msg ${msg.sender === 'bot' ? 'ai-bot' : 'ai-user'}`}>
                {msg.text}
              </div>
            ))}
            {showCalendarWidget && (
              <div className="chat-calendar-card">
                <div className="chat-calendar-title">📅 Reserve Priority Consultation Slot</div>
                <input type="datetime-local" value={chatSlot} onChange={e => setChatSlot(e.target.value)} className="chat-calendar-input" />
                <button className="chat-calendar-btn" onClick={confirmChatSlot}>Confirm Slot Reservation</button>
                {chatSlotStatus.text && <p style={{ fontSize: '0.74rem', marginTop: '6px', fontWeight: 600, color: chatSlotStatus.color }}>{chatSlotStatus.text}</p>}
              </div>
            )}
          </div>
          <div className="ai-chat-footer">
            <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendAiMessage()} className="ai-chat-input" maxLength={300} placeholder="Type message..." />
            <button className="ai-send-btn" onClick={sendAiMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}