"use client";

import { useEffect, useState } from "react";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location_name: string;
  location_address: string | null;
  lat: number;
  lng: number;
  image_url: string | null;
  source_url: string;
  organizer: string | null;
}

const SUPABASE_URL = "https://rfqbhuqhahgqjkjxmzeg.supabase.co/rest/v1/events";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWJodXFoYWhncWpranhtemVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTIzMTYsImV4cCI6MjA4ODM4ODMxNn0.Dkltc3jnHp2oanNC8DlMx5mQ-Xe8RSHuFjfZuTeJZAU";

const CATEGORY_COLORS: Record<string, string> = {
  AI: "#ec4899",
  Web3: "#f59e0b",
  Finance: "#10b981",
  Fintech: "#10b981",
  VC: "#3b82f6",
  Startup: "#8b5cf6",
  Tech: "#334155",
  Networking: "#06b6d4"
};

export default function EventsPageClient() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const url = `${SUPABASE_URL}?status=eq.approved&date=gte.${today}&select=*&order=date.asc,time.asc`;

      const response = await fetch(url, {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_KEY}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", ...Array.from(new Set(events.map(e => e.category)))];
  const filteredEvents = selectedCategory === "all"
    ? events
    : events.filter(e => e.category === selectedCategory);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="events-page">
      <header className="events-header">
        <h1>London Tech Events</h1>
        <p>{filteredEvents.length} upcoming events</p>
      </header>

      <div className="events-filters">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? "active" : ""}
            style={{
              backgroundColor: selectedCategory === cat
                ? CATEGORY_COLORS[cat] || "#334155"
                : "transparent",
              borderColor: CATEGORY_COLORS[cat] || "#334155"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="events-loading">Loading events...</div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => (
            <a
              key={event.id}
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="event-card"
            >
              {event.image_url && (
                <div
                  className="event-image"
                  style={{ backgroundImage: `url(${event.image_url})` }}
                />
              )}
              <div className="event-content">
                <div className="event-meta">
                  <span
                    className="event-category"
                    style={{
                      backgroundColor: CATEGORY_COLORS[event.category] || "#334155"
                    }}
                  >
                    {event.category}
                  </span>
                  <span className="event-date">
                    {formatDate(event.date)} • {formatTime(event.time)}
                  </span>
                </div>
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>
                <div className="event-location">
                  📍 {event.location_address || event.location_name}
                </div>
                {event.organizer && (
                  <div className="event-organizer">
                    by {event.organizer}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      <footer className="events-footer">
        <a href="/" className="back-link">← Back to map</a>
      </footer>
    </div>
  );
}
