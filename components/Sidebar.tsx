import { OfficeListing } from "@/lib/types";
import { formatGBP } from "@/lib/mapUtils";

interface SidebarProps {
  listings: OfficeListing[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function Sidebar({ listings, selectedId, onSelect }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>East London Offices</h2>
        <span>{listings.length} visible</span>
      </div>
      <div className="sidebar-list">
        {listings.map((listing) => (
          <button
            type="button"
            className={`sidebar-item ${selectedId === listing.id ? "active" : ""}`}
            key={listing.id}
            onClick={() => onSelect(listing.id)}
          >
            <h3>{listing.name}</h3>
            <p>{listing.address}</p>
            <p>
              {listing.desk_count} desks · {formatGBP(listing.monthly_cost)} / mo
            </p>
          </button>
        ))}
      </div>
    </aside>
  );
}
