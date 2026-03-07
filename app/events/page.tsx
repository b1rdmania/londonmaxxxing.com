"use client";

import dynamic from 'next/dynamic';

const EventsPageClient = dynamic(() => import('@/components/EventsPageClient'), {
  ssr: false,
  loading: () => <div style={{ padding: '48px', textAlign: 'center' }}>Loading events...</div>
});

export default function EventsPage() {
  return <EventsPageClient />;
}
