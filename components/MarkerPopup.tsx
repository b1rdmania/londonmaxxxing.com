import { OfficeListing } from "@/lib/types";
import { formatGBP } from "@/lib/mapUtils";

interface MarkerPopupProps {
  listing: OfficeListing;
}

export default function MarkerPopup({ listing }: MarkerPopupProps) {
  return (
    <div className="popup-card">
      <h3>{listing.name}</h3>
      <p>{listing.address}</p>
      <p>
        Desks: <strong>{listing.desk_count}</strong>
      </p>
      <p>
        Monthly cost: <strong>{formatGBP(listing.monthly_cost)}</strong>
      </p>
      {listing.cost_per_desk ? (
        <p>
          Cost per desk: <strong>{formatGBP(listing.cost_per_desk)}</strong>
        </p>
      ) : null}
      <p>
        Available: <strong>{listing.availability_date}</strong>
      </p>
      <p>
        Broker: <strong>{listing.broker_name}</strong>
      </p>
      <a href={listing.source_url} target="_blank" rel="noreferrer">
        View listing
      </a>
    </div>
  );
}
