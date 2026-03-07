'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location_name: string;
  location_address: string | null;
  image_url: string | null;
  source_url: string;
  organizer: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  AI: '#ec4899',
  Web3: '#f59e0b',
  Finance: '#10b981',
  Fintech: '#10b981',
  VC: '#3b82f6',
  Startup: '#8b5cf6',
  Tech: '#334155',
  Networking: '#06b6d4'
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategories, setActiveCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(
      'https://rfqbhuqhahgqjkjxmzeg.supabase.co/rest/v1/events?status=eq.approved&date=gte.2026-03-07&select=*&order=date.asc,time.asc',
      {
        headers: {
          apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWJodXFoYWhncWpranhtemVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTIzMTYsImV4cCI6MjA4ODM4ODMxNn0.Dkltc3jnHp2oanNC8DlMx5mQ-Xe8RSHuFjfZuTeJZAU',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWJodXFoYWhncWpranhtemVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTIzMTYsImV4cCI6MjA4ODM4ODMxNn0.Dkltc3jnHp2oanNC8DlMx5mQ-Xe8RSHuFjfZuTeJZAU'
        }
      }
    )
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        // Initialize all categories as active
        const categories = Array.from(new Set<string>(data.map((e: Event) => e.category)));
        const initial: Record<string, boolean> = {};
        categories.forEach(cat => {
          initial[cat] = true;
        });
        setActiveCategories(initial);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => activeCategories[event.category]);
  }, [events, activeCategories]);

  const categories = useMemo(() => {
    return Array.from(new Set(events.map(e => e.category))).sort();
  }, [events]);

  const toggleCategory = (category: string) => {
    setActiveCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (loading) {
    return (
      <div className="shell">
        <div className="topbar">
          <div className="topbar-brand">
            <h1>london tech heatmap</h1>
          </div>
        </div>
        <div style={{ padding: '48px', textAlign: 'center' }}>loading events...</div>
      </div>
    );
  }

  return (
    <div className="shell">
      <div className="topbar">
        <div className="topbar-brand">
          <h1>london tech heatmap</h1>
          <span className="subtle">— {filteredEvents.length} events</span>
        </div>
        <div className="topbar-nav">
          <Link href="/">map</Link>
          <Link href="/events">events</Link>
          <a href="https://x.com/intent/tweet?text=London%20tech%20ecosystem%20map%20%E2%80%94%20251%2B%20AI%20labs%2C%20VCs%2C%20fintechs%2C%20and%20startups%20%F0%9F%94%A5%0A%0Aby%20%40b1rdmania&url=https%3A%2F%2Flondonmaxxxing.com" target="_blank" rel="noopener noreferrer">share</a>
          <Link href="/embed-code">embed</Link>
        </div>
      </div>

      <div className="topbar" style={{ borderTop: 'none' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="toggle-btn"
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                background: activeCategories[cat] ? (CATEGORY_COLORS[cat] || '#000') : '#fff',
                color: activeCategories[cat] ? '#fff' : '#000',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'Times New Roman',
                textTransform: 'lowercase'
              }}
            >
              {cat.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {filteredEvents.map(event => (
          <a
            key={event.id}
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ border: '1px solid #ddd', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s' }}
          >
            {event.image_url && (
              <div style={{ width: '100%', height: '200px', backgroundImage: `url(${event.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#f5f5f5' }} />
            )}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {event.category.toLowerCase()} • {new Date(event.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'normal', lineHeight: '1.3', margin: 0 }}>{event.title}</h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', margin: 0 }}>{event.description}</p>
              <div style={{ fontSize: '13px', color: '#666', marginTop: 'auto' }}>
                📍 {event.location_address || event.location_name}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
