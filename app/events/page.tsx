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
          <h1>London tech heatmap 🔥</h1>
          <span className="topbar-cta">
            [{filteredEvents.length} events] [
            <Link href="/">map</Link>
            ] [
            <Link href="/events">events</Link>
            ]
          </span>
        </div>
        <nav className="topbar-nav" aria-label="Event categories">
          <span className="topbar-cta topbar-toggle-label">toggle:</span>
          {categories.map(cat => {
            const isOn = activeCategories[cat];
            return (
              <button
                key={cat}
                type="button"
                className={isOn ? "topbar-btn active" : "topbar-btn"}
                onClick={() => toggleCategory(cat)}
              >
                <span
                  className="dot"
                  style={{
                    background: isOn ? (CATEGORY_COLORS[cat] || '#000') : 'transparent',
                    borderColor: CATEGORY_COLORS[cat] || '#000'
                  }}
                  aria-hidden="true"
                />
                {cat.toLowerCase()}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="events-grid-container" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
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
