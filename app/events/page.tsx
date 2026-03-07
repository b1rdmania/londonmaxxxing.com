'use client';

import { useEffect, useState } from 'react';

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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'Times New Roman' }}>Loading events...</div>;
  }

  return (
    <div style={{ fontFamily: 'Times New Roman', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid #ddd', padding: '32px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'normal', margin: '0 0 8px 0' }}>London Tech Events</h1>
        <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>{events.length} upcoming events</p>
      </header>

      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {events.map(event => (
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
                {event.category} • {new Date(event.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
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

      <footer style={{ padding: '32px 24px', textAlign: 'center', borderTop: '1px solid #ddd' }}>
        <a href="/" style={{ color: '#000', textDecoration: 'none', fontSize: '16px' }}>← Back to map</a>
      </footer>
    </div>
  );
}
