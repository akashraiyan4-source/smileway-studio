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

  // ভিডিও ও অডিও আইসোলেশন হ্যান্ডলিং (Start, Transition, End আলাদা সাউন্ড লজিক)
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

  if (!mounted) return null;

  // সাউন্ড টগল (প্রতিটি ভিডিওর সাউন্ড আলাদা ও নিখুঁতভাবে কন্ট্রোল করার জন্য)
  const toggleSound = () => {
    triggerHaptic(20);
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    
    // ফানেল স্টেপ অনুযায়ী শুধুমাত্র রানিং ভিডিওটির সাউন্ড অ্যাপ্লাই হবে, অন্যগুলো মিউটেড থাকবে
    if (vidStartRef.current) vidStartRef.current.muted = funnelStep === 0 ? nextMuted : true;
    if (vidTransRef.current) vidTransRef.current.muted = funnelStep === 1 ? nextMuted : true;
    if (vidEndRef.current) vidEndRef.current.muted = funnelStep >= 2 ? nextMuted : true;
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

    // স্যাড লুপ সম্পূর্ণ বন্ধ ও মিউট করা
    if (vidStartRef.current) {
      vidStartRef.current.pause();
      vidStartRef.current.muted = true;
      vidStartRef.current.style.opacity = '0';
    }

    // ট্রানজিশন লুপ চালু ও সাউন্ড আইসোলেশন মেইনটেইন করা
    if (vidTransRef.current) {
      vidTransRef.current.style.opacity = '1';
      vidTransRef.current.currentTime = 0;
      vidTransRef.current.muted = isMuted; // শুধু ট্রানজিশন চলাকালীন সাউন্ড পাবে
      vidTransRef.current.play().catch(() => {});

      vidTransRef.current.onended = () => {
        if (vidTransRef.current) {
          vidTransRef.current.pause();
          vidTransRef.current.muted = true;
          vidTransRef.current.style.opacity = '0';
        }
        
        // হ্যাপি লুপ (End) চালু এবং স্যাড বা ট্রানজিশনের সাউন্ড সম্পূর্ণ অফ রাখা
        if (vidEndRef.current) {
          vidEndRef.current.style.opacity = '1';
          vidEndRef.current.currentTime = 0;
          vidEndRef.current.muted = isMuted; // হ্যাপি লুপ তার নিজস্ব সাউন্ড পাবে
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

  // ড্রয়ার ফর্ম সাবমিশন (সঠিক এপিআই পাথ: /api/booking/create)
  const submitDrawerForm = async () => {
    if (!drawerName.trim() || !drawerPhone.trim()) {
      alert('Please fill in both your name and phone number.');
      return;
    }
    try {
      const response = await fetch('/api/booking/create', {
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

  // মেইন ফর্ম সাবমিশন (সঠিক এপিআই পাথ: /api/booking/create বা /api/leads)
  const submitMainForm = async () => {
    if (!mainName.trim() || !mainPhone.trim() || !mainAppointmentDate) {
      alert('Please fill in your name, phone number, and select a preferred consultation date.');
      return;
    }
    try {
      const response = await fetch('/api/booking/create', {
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
      const response = await fetch('/api/booking/create', {
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
        .swipe-arrow-handle { height: 84px; width: 96px; background: transparent !important; border: none !important; box-shadow: none !important; display: flex; align-items: center; justify-content: center; cursor: grab; position: absolute; left: 6px; top: 50%; transform: translate3d(0, -50%, 0); z-index: 30; }
        .swipe-arrow-handle svg { width: 80px; height: 80px; fill: #ffffff !important; filter: drop-shadow(0 3px 10px rgba(0,0,0,0.8)); pointer-events: none; }

        .half-form-drawer { position: absolute; bottom: 0; left: 0; right: 0; height: 56%; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 12px 12px 0 0; box-shadow: 0 -20px 40px rgba(0, 0, 0, 0.15); z-index: 40; display: flex; flex-direction: column; padding: 26px 22px; transform: translate3d(0, 100%, 0); transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1); border-top: 1.5px solid var(--apple-border); overflow-y: auto; }
        .half-form-drawer.open { transform: translate3d(0, 0, 0); }
        .drawer-header { text-align: center; margin-bottom: 14px; padding-right: 20px; }
        .drawer-title { color: var(--apple-dark); font-size: 1.25rem; font-weight: 800; }
        .drawer-sub { color: var(--apple-gray); font-size: 0.78rem; margin-top: 4px; }
        .drawer-input { width: 100%; background: var(--card-pure-white); border: 1px solid var(--apple-border); padding: 13px 16px; border-radius: 6px; font-size: 0.9rem; color: var(--apple-dark); margin-bottom: 12px; outline: none; }
        .drawer-btn { width: 100%; background: var(--apple-blue); border: none; padding: 14px; border-radius: 6px; color: #ffffff; font-size: 0.95rem; font-weight: 700; cursor: pointer; box-shadow: 0 6px 18px rgba(0,113,227,0.35); transition: transform 0.2s ease; }
        .drawer-btn:hover { transform: translateY(-2px); }
        .drawer-dismiss { position: absolute; top: 18px; right: 18px; background: var(--page-cream); border: none; width: 30px; height: 30px; border-radius: 50%; color: var(--apple-gray); font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        
        .animate-on-scroll { opacity: 0; transform: translateY(30px); transition: opacity 0.7s cubic-bezier(0.25, 1, 0.5, 1), transform 0.7s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform, opacity; }
        .animate-on-scroll.is-visible { opacity: 1; transform: translateY(0); }
        .content-container { max-width: 1000px; margin: 0 auto; width: 100%; padding: 0 28px; }
        .section-padding { padding: 70px 0; }
        .section-top-tight { padding-top: 20px; }
        .sec-tag { font-size: 0.85rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--apple-blue); margin-bottom: 12px; }
        .sec-heading { font-size: 2.5rem; font-weight: 800; color: var(--apple-dark); letter-spacing: -0.035em; line-height: 1.2; margin-bottom: 30px; }
        
        .doctor-card { position: relative; border-radius: 10px; overflow: hidden; margin-bottom: 32px; background: var(--card-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1.5px solid var(--apple-border); box-shadow: 0 15px 40px rgba(0, 0, 0, 0.05); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; }
        .doctor-card:hover { transform: translateY(-4px); border-color: rgba(0, 113, 227, 0.4); background: rgba(0, 113, 227, 0.02); box-shadow: 0 25px 60px rgba(0, 113, 227, 0.15); }
        .doc-img { width: 100%; height: 580px; object-fit: cover; object-position: center 20%; display: block; background: #f1f5f9; }
        .doc-tag { position: absolute; top: 24px; right: 24px; background: rgba(255, 255, 255, 0.97); padding: 10px 20px; border-radius: 6px; font-size: 0.82rem; font-weight: 700; color: var(--apple-blue); border: 1px solid var(--apple-border); box-shadow: 0 6px 16px rgba(0,0,0,0.06); }
        
        .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
        .stat-pill { background: var(--card-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1.5px solid var(--apple-border); border-radius: 8px; padding: 26px 20px; text-align: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; }
        .stat-pill:hover { transform: translateY(-4px); border-color: rgba(0, 113, 227, 0.4); background: rgba(0, 113, 227, 0.02); box-shadow: 0 20px 45px rgba(0, 113, 227, 0.15); }
        .stat-num { font-size: 2.2rem; font-weight: 900; color: var(--apple-dark); margin-bottom: 6px; }
        .stat-label { font-size: 0.86rem; font-weight: 600; color: var(--apple-gray); }
        
        .accreditation-row { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 28px; justify-content: center; }
        .acc-badge { background: var(--card-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1.5px solid var(--apple-border); color: var(--apple-dark); font-size: 0.84rem; font-weight: 700; padding: 11px 22px; border-radius: 6px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.03); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; }
        .acc-badge:hover { transform: translateY(-3px); border-color: rgba(0, 113, 227, 0.4); background: rgba(0, 113, 227, 0.02); box-shadow: 0 12px 30px rgba(0, 113, 227, 0.12); }
        
        .infinite-marquee-box { width: 100%; overflow: hidden; position: relative; margin: 16px 0 24px 0; cursor: grab; touch-action: pan-y pinch-zoom; }
        .infinite-marquee-inner { display: flex; gap: 24px; width: max-content; }
        
        .review-bubble { width: 340px; flex-shrink: 0; background: var(--card-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1.5px solid var(--apple-border); border-radius: 8px; padding: 28px; box-shadow: 0 12px 35px rgba(0, 0, 0, 0.04); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; }
        .review-bubble:hover { transform: translateY(-4px); border-color: rgba(0, 113, 227, 0.4); background: rgba(0, 113, 227, 0.02); box-shadow: 0 22px 50px rgba(0, 113, 227, 0.15); }
        .rev-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .rev-name { font-size: 0.96rem; font-weight: 800; color: var(--apple-dark); }
        .rev-quote { font-size: 0.92rem; line-height: 1.65; color: var(--apple-gray); }
        
        .interactive-cases-box { width: 100%; overflow: hidden; position: relative; margin: 16px 0 24px 0; cursor: grab; touch-action: pan-y pinch-zoom; }
        .interactive-cases-inner { display: flex; gap: 24px; width: max-content; }
        .case-card-stream { width: 340px; flex-shrink: 0; background: var(--card-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1.5px solid var(--apple-border); border-radius: 8px; padding: 20px; box-shadow: 0 12px 35px rgba(0, 0, 0, 0.04); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; }
        .case-card-stream:hover { transform: translateY(-4px); border-color: rgba(0, 113, 227, 0.4); background: rgba(0, 113, 227, 0.02); box-shadow: 0 22px 50px rgba(0, 113, 227, 0.15); }
        .case-photo-slot { position: relative; border-radius: 6px; overflow: hidden; height: 260px; margin-bottom: 14px; background: #e2e5e9; }
        .case-photo-slot img { width: 100%; height: 100%; object-fit: cover; display: block; filter: contrast(1.05) brightness(1.02); }
        
        .faq-list { display: flex; flex-direction: column; gap: 16px; }
        .faq-item { background: var(--card-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1.5px solid var(--apple-border); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .faq-item:hover { border-color: rgba(0, 113, 227, 0.3); background: rgba(0, 113, 227, 0.01); }
        .faq-question { width: 100%; padding: 22px 26px; background: transparent; border: none; outline: none; display: flex; justify-content: space-between; align-items: center; font-size: 1rem; font-weight: 700; color: var(--apple-dark); text-align: left; cursor: pointer; }
        .faq-chevron { font-size: 1.4rem; color: var(--apple-gray); transition: transform 0.3s ease; }
        .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1), padding 0.4s ease; padding: 0 26px; font-size: 0.92rem; color: var(--apple-gray); line-height: 1.7; }
        .faq-item.active .faq-answer { max-height: 220px; padding-bottom: 22px; }
        .faq-item.active .faq-chevron { transform: rotate(45deg); color: var(--apple-blue); }

        .consult-card { background: var(--card-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1.5px solid var(--apple-border); border-radius: 10px; padding: 42px 36px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.06); margin-bottom: 34px; transition: all 0.4s ease; }
        .consult-card:hover { border-color: rgba(0, 113, 227, 0.4); box-shadow: 0 28px 70px rgba(0, 113, 227, 0.12); }
        .slots-pill { display: inline-flex; align-items: center; gap: 8px; background: #fff8eb; border: 1px solid #ffe2b3; padding: 9px 18px; border-radius: 6px; font-size: 0.82rem; font-weight: 700; color: #b25e00; margin-bottom: 20px; }
        .slots-dot { width: 8px; height: 8px; border-radius: 50%; background: #ff9500; }
        .guarantee-strip { display: flex; flex-direction: column; align-items: flex-start; text-align: left; gap: 10px; background: #f2faf4; border: 1px solid #d1edd8; border-radius: 6px; padding: 18px 20px; margin-top: 14px; margin-bottom: 24px; font-size: 0.86rem; font-weight: 700; color: #248a3d; width: 100%; }
        
        .form-input { width: 100%; background: var(--card-pure-white); border: 1px solid var(--apple-border); padding: 16px 20px; border-radius: 6px; font-size: 0.98rem; color: var(--apple-dark); margin-bottom: 16px; outline: none; transition: border-color 0.2s ease; }
        .form-input:focus { border-color: var(--apple-blue); }
        
        .btn-confirm { width: 100%; background: var(--apple-blue); color: #ffffff; padding: 18px; border-radius: 6px; font-size: 1.05rem; font-weight: 700; cursor: pointer; border: none; box-shadow: 0 10px 25px rgba(0, 113, 227, 0.25); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .btn-confirm:hover { transform: translateY(-3px); box-shadow: 0 14px 35px rgba(0, 113, 227, 0.35); background: #0077ed; }
        
        .map-preview-card { position: relative; border-radius: 10px; overflow: hidden; border: 1.5px solid var(--apple-border); background: #ffffff; display: flex; flex-direction: column; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.05); }
        .map-preview-iframe-container { position: relative; width: 100%; height: 400px; background: #e5e3df; }
        .map-preview-iframe-container iframe { width: 100%; height: 100%; border: 0; display: block; }
        .map-floating-badge { position: absolute; top: 20px; left: 20px; background: #ffffff; border-radius: 6px; padding: 16px 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12); display: flex; align-items: center; justify-content: space-between; gap: 20px; max-width: 360px; width: calc(100% - 40px); z-index: 10; border: 1px solid var(--apple-border); }
        .map-badge-title { font-size: 0.95rem; font-weight: 800; color: var(--apple-dark); line-height: 1.2; }
        .map-badge-sub { font-size: 0.78rem; color: var(--apple-gray); margin-top: 3px; }
        .map-badge-icons { display: flex; gap: 10px; align-items: center; }
        .map-icon-btn { width: 36px; height: 36px; border-radius: 6px; background: #f0f4fd; border: 1px solid rgba(0, 113, 227, 0.2); display: flex; align-items: center; justify-content: center; color: var(--apple-blue); text-decoration: none; font-size: 1rem; transition: transform 0.2s ease; }
        .map-icon-btn:hover { transform: translateY(-2px); }

        /* FIXED FLOATING AI (Bottom Right Corner) */
        .floating-ai { 
          position: fixed !important; 
          bottom: 32px !important; 
          right: 32px !important; 
          top: auto !important; 
          left: auto !important; 
          transform: none !important; 
          z-index: 2147483647 !important; 
          background: rgba(255, 255, 255, 0.98); 
          border: 1.5px solid var(--apple-border); 
          width: 60px; 
          height: 60px; 
          border-radius: 50%; 
          display: flex !important; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25); 
          cursor: pointer; 
          transition: transform 0.4s ease; 
        }
        .floating-ai.rotated { 
          transform: rotate(360deg) scale(1.05) !important; 
        }
        .ai-avatar { font-size: 1.7rem; line-height: 1; display: inline-block; transition: transform 0.4s ease; }
        .status-dot-tiny { width: 11px; height: 11px; border-radius: 50%; background: #34c759; position: absolute; top: 4px; right: 4px; border: 2px solid #ffffff; box-shadow: 0 0 6px rgba(52, 199, 89, 0.8); }
        
        /* FIXED AI CHAT MODAL */
        .ai-chat-modal { 
          position: fixed !important; 
          bottom: 104px !important; 
          right: 32px !important; 
          top: auto !important; 
          left: auto !important; 
          transform: none !important; 
          width: 420px !important; 
          max-width: calc(100vw - 32px) !important; 
          height: 580px !important; 
          max-height: calc(100vh - 130px) !important; 
          z-index: 2147483646 !important; 
          display: flex !important; 
          flex-direction: column !important; 
          opacity: 0; 
          pointer-events: none; 
          transform-origin: bottom right; 
          transition: all 0.3s ease; 
        }
        .ai-chat-modal.active { 
          opacity: 1 !important; 
          pointer-events: auto !important; 
          transform: none !important; 
        }
        .ai-chat-window { background: #ffffff; width: 100%; height: 100%; border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2); border: 1px solid var(--apple-border); overflow: hidden; }
        
        .ai-chat-header { padding: 0 !important; background: #ffffff !important; border-bottom: 1px solid var(--apple-border); display: flex; align-items: center; justify-content: space-between; height: 64px; padding-left: 20px; padding-right: 20px; }
        .ai-header-left { display: flex; align-items: center; gap: 8px; color: var(--apple-dark); }
        .ai-header-right { display: flex; align-items: center; }

        .ai-chat-body { flex: 1; padding: 22px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; background: var(--page-cream); }
        .ai-msg { max-width: 85%; padding: 13px 18px; border-radius: 8px; font-size: 0.9rem; line-height: 1.55; }
        .ai-bot { background: #ffffff; color: var(--apple-dark); align-self: flex-start; border: 1px solid var(--apple-border); }
        .ai-user { background: var(--apple-blue); color: #ffffff; align-self: flex-end; }
        .ai-chat-footer { padding: 16px 22px; border-top: 1px solid var(--apple-border); display: flex; gap: 12px; background: #ffffff; }
        .ai-chat-input { flex: 1; border: 1px solid var(--apple-border); background: var(--card-pure-white); border-radius: 6px; padding: 12px 20px; font-size: 0.9rem; outline: none; }
        .ai-send-btn { background: var(--apple-blue); color: #ffffff; border: none; padding: 10px 22px; border-radius: 6px; font-size: 0.88rem; font-weight: 700; cursor: pointer; transition: transform 0.2s ease; }
        .ai-send-btn:hover { transform: translateY(-2px); }
        
        .chat-calendar-card { align-self: flex-start; width: 90%; background: #ffffff; border: 1.5px solid #0071e3; border-radius: 8px; padding: 18px; box-shadow: 0 10px 28px rgba(0, 113, 227, 0.15); }
        .chat-calendar-title { font-size: 0.9rem; font-weight: 700; color: #0071e3; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .chat-calendar-input { width: 100%; background: var(--card-pure-white); border: 1px solid var(--apple-border); padding: 11px 14px; border-radius: 6px; font-size: 0.88rem; color: var(--apple-dark); margin-bottom: 12px; outline: none; }
        .chat-calendar-btn { width: 100%; background: #0071e3; color: #fff; border: none; padding: 12px; border-radius: 6px; font-size: 0.88rem; font-weight: 700; cursor: pointer; }
        
        .extra-features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin: 40px 0; }
        .extra-feature-card { background: var(--card-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1.5px solid var(--apple-border); border-radius: 10px; padding: 28px; box-shadow: 0 12px 35px rgba(0, 0, 0, 0.04); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; }
        .extra-feature-card:hover { transform: translateY(-4px); border-color: rgba(0, 113, 227, 0.4); background: rgba(0, 113, 227, 0.02); box-shadow: 0 25px 60px rgba(0, 113, 227, 0.15); }
        .extra-feature-icon { font-size: 2rem; margin-bottom: 12px; }
        .extra-feature-title { font-size: 1.15rem; font-weight: 800; color: var(--apple-dark); margin-bottom: 8px; }
        .extra-feature-desc { font-size: 0.9rem; color: var(--apple-gray); line-height: 1.6; }

        footer { padding: 24px 28px 36px 28px; text-align: center; font-size: 0.84rem; color: var(--apple-gray); border-top: 1px solid var(--apple-border); background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); }
        
        @media (max-width: 768px) {
          header { padding: 16px 20px; justify-content: center !important; }
          .brand-title { font-size: 1.25rem; text-align: center; }
          .phone-badge { display: none; }
          .rating-strip { font-size: 0.8rem; padding: 12px 16px; text-align: center; }
          .hero-split-grid { grid-template-columns: 1fr; padding: 0 20px 40px 20px !important; gap: 24px; text-align: center; justify-items: center; }
          .hero-text-col { align-items: center; text-align: center; gap: 16px; width: 100%; }
          .hero-sub-copy { max-width: 100%; text-align: center; }
          .hero-pill-cluster { justify-content: center; }
          .hero-box { order: -1; width: 100% !important; max-width: 100% !important; height: 75vh !important; aspect-ratio: auto !important; margin: 0 auto !important; border-radius: 12px !important; }
          .hero-main-title { font-size: 2.5rem !important; line-height: 1.12 !important; text-align: center; }
          .extra-features-grid { grid-template-columns: 1fr; }
          .stats-row { grid-template-columns: 1fr; }
          .content-container { padding: 0 16px; }
          .ai-chat-modal { bottom: 98px !important; right: 14px !important; left: 14px !important; width: calc(100vw - 28px) !important; height: min(580px, 80vh) !important; }
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

      <section className="hero-split-grid">
        <div className="hero-text-col">
          <div className="hero-tagline">• BEVERLY HILLS AESTHETIC DENTISTRY</div>
          <h1 className="hero-main-title">Architectural <span className="highlight-text">Smile Design</span> & Porcelain Art</h1>
          <p className="hero-sub-copy">
            Zero-pain bio-enamel restoration and <span className="highlight-text">bespoke ultra-thin veneers</span> designed for natural radiance. Zero invasive grinding, 100% harmonious bite alignment, and private VIP treatment suites.
          </p>
          <div className="hero-pill-cluster">
            <div className="h-pill service-trigger-btn" data-topic="Zero-Prep Micro Veneers" style={{cursor: 'pointer'}}><span>✨</span> Zero-Prep Micro Veneers</div>
            <div className="h-pill service-trigger-btn" data-topic="10-Year Structural Warranty" style={{cursor: 'pointer'}}><span>🛡</span> 10-Year Structural Warranty</div>
            <div className="h-pill service-trigger-btn" data-topic="48-Hour Digital Smile Preview" style={{cursor: 'pointer'}}><span>⏱️</span> 48-Hour Digital Smile Preview</div>
          </div>
          <div style={{ marginTop: '16px', width: '100%', display: 'flex' }}>
            <a href="#consultation-area" className="hero-cta-btn service-trigger-btn" data-topic="Priority Smile Triage">Reserve Priority Smile Triage →</a>
          </div>
        </div>

        <div className="hero-box" id="heroSec" ref={heroBoxRef}>
          <video ref={vidStartRef} className="hero-vid" src="/niches/dental/start.mp4" playsInline autoPlay muted loop preload="auto" style={{ zIndex: 1, opacity: 1 }}></video>
          <video ref={vidTransRef} className="hero-vid" src="/niches/dental/trans.mp4" playsInline muted preload="auto" style={{ zIndex: 2, opacity: 0, pointerEvents: 'none' }}></video>
          <video ref={vidEndRef} className="hero-vid" src="/niches/dental/end.mp4" playsInline muted loop preload="auto" style={{ zIndex: 3, opacity: 0, pointerEvents: 'none' }}></video>

          <button className="glass-sound-btn" onClick={toggleSound} aria-label="Toggle Sound">
            <svg dangerouslySetInnerHTML={{ __html: isMuted ? mutedSvg : unmutedSvg }} viewBox="0 0 24 24" />
          </button>

          <div className="swipe-interactive-zone" id="swipeTrack" ref={trackRef}>
            <div className="swipe-arrow-handle" id="swipeKnob" ref={knobRef} onPointerDown={handlePointerDownKnob}>
              <svg ref={knobSvgRef} viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </div>
          </div>

          <div className={`half-form-drawer ${isDrawerOpen ? 'open' : ''}`} id="heroDrawer">
            <button className="drawer-dismiss" onClick={closeHeroDrawer}>×</button>
            <div className="drawer-header">
              <h3 className="drawer-title">Claim Your Confidence</h3>
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

      <div className="press-trust-bar">
        <div className="press-trust-inner">
          <span>Vogue</span> • <span>Beverly Hills Living</span> • <span>LA Times</span> • <span>Forbes</span> • 
          <span>Vogue</span> • <span>Beverly Hills Living</span> • <span>LA Times</span> • <span>Forbes</span>
        </div>
      </div>

      <div className="celebrity-ticker-bar">
        <div className="celebrity-ticker-inner">
          <span>🌟 Featured in Hollywood Reporter</span> • 
          <span>🏆 Voted #1 Beverly Hills Smile Studio</span> • 
          <span>⭐ Trusted by A-List LA Celebrities</span> • 
          <span>✨ 48-Hour Digital Smile Triage</span> •
          <span>🌟 Featured in Hollywood Reporter</span> • 
          <span>🏆 Voted #1 Beverly Hills Smile Studio</span> • 
          <span>⭐ Trusted by A-List LA Celebrities</span> • 
          <span>✨ 48-Hour Digital Smile Triage</span>
        </div>
      </div>

      <div className="content-container">
        <section className="section-padding section-top-tight animate-on-scroll">
          <div className="doctor-card service-trigger-btn" data-topic="Dr. Julian Vance Consultation">
            <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1000&auto=format&fit=crop" alt="Dr Julian Vance" className="doc-img" onError={(e)=>{(e.target as HTMLElement).style.display='none'}} />
            <div className="doc-tag">★ Chief Cosmetic Dentist</div>
          </div>
          <div className="sec-tag">Oral Restoration Authority</div>
          <h2 className="sec-heading">Dr. Julian Vance, DDS</h2>
          <p style={{ fontSize: '1.08rem', color: 'var(--apple-gray)', lineHeight: '1.75' }}>
            Specializing in zero-pain bio-enamel restoration and handcrafted porcelain veneers. Delivering transformative bite alignment and natural aesthetic radiance for high-profile smiles.
          </p>
          <div className="stats-row">
            <div className="stat-pill service-trigger-btn" data-topic="12,400+ Success Track Record">
              <div className="stat-num">12,400+</div>
              <div className="stat-label">Cases Handled</div>
            </div>
            <div className="stat-pill service-trigger-btn" data-topic="99.8% Success Rate Assurance">
              <div className="stat-num">99.8%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
          <div className="accreditation-row">
            <span className="acc-badge service-trigger-btn" data-topic="AACD Accreditation">✓ AACD Accredited</span>
            <span className="acc-badge service-trigger-btn" data-topic="ADA Membership">✓ ADA Member</span>
            <span className="acc-badge service-trigger-btn" data-topic="Top Doctor Recognition">★ Top Doctor 2026</span>
            <span className="acc-badge service-trigger-btn" data-topic="Invisalign Diamond Provider">✦ Invisalign Diamond</span>
          </div>
        </section>

        <section className="section-padding animate-on-scroll" style={{ paddingTop: 0 }}>
          <div className="sec-tag">Elite Standards</div>
          <h2 className="sec-heading">Exclusive Beverly Hills Protocol</h2>
          <div className="extra-features-grid">
            <div className="extra-feature-card service-trigger-btn" data-topic="In-House Master Atelier Lab">
              <div className="extra-feature-icon">🏛</div>
              <h3 className="extra-feature-title">In-House Master Atelier Lab</h3>
              <p className="extra-feature-desc">All porcelain art and micro-veneers are handcrafted on-site by our master ceramists, ensuring absolute shade matching and zero outsourcing delays.</p>
            </div>
            <div className="extra-feature-card service-trigger-btn" data-topic="VIP Sedation & Comfort Protocol">
              <div className="extra-feature-icon">🌿</div>
              <h3 className="extra-feature-title">VIP Sedation & Comfort Protocol</h3>
              <p className="extra-feature-desc">Engineered for high-profile and anxiety-free visits with bespoke IV sedation, NuCalm relaxation, and complete privacy suites.</p>
            </div>
            <div className="extra-feature-card service-trigger-btn" data-topic="Bespoke Financing & Investment">
              <div className="extra-feature-icon">💳</div>
              <h3 className="extra-feature-title">Bespoke Financing & Investment</h3>
              <p className="extra-feature-desc">Transparent 0% APR monthly installments and concierge insurance advocacy tailored for high-ticket architectural smile investments.</p>
            </div>
            <div className="extra-feature-card service-trigger-btn" data-topic="Step-by-Step 3D Smile Triage">
              <div className="extra-feature-icon">✨</div>
              <h3 className="extra-feature-title">Step-by-Step 3D Smile Triage</h3>
              <p className="extra-feature-desc">A precise 4-stage digital workflow from 3D facial scan to virtual mockup preview, guaranteeing your exact aesthetic outcome before work starts.</p>
            </div>
          </div>
        </section>

        <section className="section-padding animate-on-scroll" style={{ paddingTop: 0 }}>
          <div className="sec-tag">Real Experiences</div>
          <h2 className="sec-heading">Google Patient Reviews</h2>
          <div className="infinite-marquee-box" id="reviewsBox">
            <div className="infinite-marquee-inner" ref={reviewsInnerRef}>
              <div className="review-bubble service-trigger-btn" data-topic="Veneers Patient Review">
                <div className="rev-head"><span className="rev-name">Elena R. <span style={{color:'var(--apple-blue)'}}>✓ Verified</span></span><span style={{color:'#ff9500', fontSize: '0.85rem'}}>★★★★★</span></div>
                <p className="rev-quote">"Got my veneers done here. 100% pain-free and natural white. Transformed my self-confidence completely!"</p>
              </div>
              <div className="review-bubble service-trigger-btn" data-topic="Same-Day Triage Review">
                <div className="rev-head"><span className="rev-name">Marcus T. <span style={{color:'var(--apple-blue)'}}>✓ Verified</span></span><span style={{color:'#ff9500', fontSize: '0.85rem'}}>★★★★★</span></div>
                <p className="rev-quote">"Dr. Vance is an absolute artist. Same-day triage and the precision mapping blew my mind."</p>
              </div>
              <div className="review-bubble service-trigger-btn" data-topic="Private Clinic Experience Review">
                <div className="rev-head"><span className="rev-name">Sophia L. <span style={{color:'var(--apple-blue)'}}>✓ Verified</span></span><span style={{color:'#ff9500', fontSize: '0.85rem'}}>★★★★★</span></div>
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
              <div className="case-card-stream service-trigger-btn" data-topic="Case #481: Micro-Thin Veneers">
                <div className="case-photo-slot"><img src="https://images.unsplash.com/photo-1606811841689-23dfddce6395?q=80&w=800&auto=format&fit=crop" alt="Transform" /></div>
                <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>Case #481: Micro-Thin Veneers</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--apple-gray)' }}>Shade BL1 • Zero-Prep Restoration</p>
              </div>
              <div className="case-card-stream service-trigger-btn" data-topic="Case #512: Full Arch Symmetry">
                <div className="case-photo-slot"><img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop" alt="Transform" /></div>
                <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>Case #512: Full Arch Symmetry</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--apple-gray)' }}>Bite Balancing • Handcrafted Ceramic</p>
              </div>
              <div className="case-card-stream service-trigger-btn" data-topic="Case #604: Precision Bio-Implant">
                <div className="case-photo-slot"><img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop" alt="Transform" /></div>
                <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>Case #604: Precision Bio-Implant</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--apple-gray)' }}>Immediate Load • Seamless Gum Blend</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding animate-on-scroll" style={{ paddingTop: 0 }}>
          <div className="sec-tag">Patient Guidance</div>
          <h2 className="sec-heading">Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <button className="faq-question" onClick={toggleFaq}>
                <span>Are zero-prep micro veneers truly reversible, and do they require shaving teeth?</span>
                <span className="faq-chevron">+</span>
              </button>
              <div className="faq-answer">
                <p>Our bio-enamel micro-veneers require zero aggressive drilling or dentin reduction, preserving 100% of your natural tooth structure while ensuring a seamless, lifelong bond.</p>
              </div>
            </div>
            <div className="faq-item">
              <button className="faq-question" onClick={toggleFaq}>
                <span>How does the 48-hour digital smile preview work?</span>
                <span className="faq-chevron">+</span>
              </button>
              <div className="faq-answer">
                <p>We utilize high-resolution 3D facial scanning and bite mapping to design your bespoke smile digitally, allowing you to preview and approve your exact aesthetic result before treatment starts.</p>
              </div>
            </div>
            <div className="faq-item">
              <button className="faq-question" onClick={toggleFaq}>
                <span>What makes SmileWay Studio's private VIP suites different?</span>
                <span className="faq-chevron">+</span>
              </button>
              <div className="faq-answer">
                <p>We offer absolute privacy with zero waiting rooms, dedicated rear valet access, personalized luxury sedation protocols, and individual attention from Chief Cosmetic Dentist Dr. Julian Vance.</p>
              </div>
            </div>
            <div className="faq-item">
              <button className="faq-question" onClick={toggleFaq}>
                <span>What kind of structural warranty is provided?</span>
                <span className="faq-chevron">+</span>
              </button>
              <div className="faq-answer">
                <p>Every full-arch restoration and handcrafted porcelain set is backed by our comprehensive 10-Year Structural Warranty, covering any chipping, fracture, or bite alignment adjustments.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding animate-on-scroll" id="consultation-area" style={{ paddingTop: 0 }}>
          <div className="consult-card">
            <div className="slots-pill"><span className="slots-dot"></span><span>Only 3 Priority Triage Slots Left This Week</span></div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>Reserve Your Consultation</h3>
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
            <button className="btn-confirm service-trigger-btn" data-topic="Priority Appointment Confirmation" onClick={submitMainForm}>Confirm Priority Appointment</button>
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

      <div className={`floating-ai ${isChatOpen ? 'rotated' : ''}`} onClick={() => setIsChatOpen(!isChatOpen)} aria-label="Toggle AI Assistant">
        <span className="ai-avatar">🤖</span>
        <span className="status-dot-tiny"></span>
      </div>

      <div className={`ai-chat-modal ${isChatOpen ? 'active' : ''}`}>
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="ai-header-left">
              <div style={{width:'9px', height:'9px', borderRadius:'50%', background:'#34c759'}}></div>
              <strong>SmileWay AI Assistant</strong>
            </div>
            <div className="ai-header-right">
              <button onClick={() => setIsChatOpen(false)} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'var(--apple-dark)'}}>×</button>
            </div>
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
                {chatSlotStatus.text && <p style={{ fontSize: '0.78rem', marginTop: '6px', fontWeight: 600, color: chatSlotStatus.color }}>{chatSlotStatus.text}</p>}
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