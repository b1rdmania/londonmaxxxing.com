import { FiltersState } from "@/lib/types";

interface FiltersProps {
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
}

export default function Filters({ filters, onChange }: FiltersProps) {
  return (
    <div className="filters">
      <select value={filters.desk} onChange={(e) => onChange({ ...filters, desk: e.target.value as FiltersState["desk"] })}>
        <option value="any">Desk count: Any</option>
        <option value="1_4">1-4</option>
        <option value="4_10">4-10</option>
        <option value="10_20">10-20</option>
        <option value="20_plus">20+</option>
      </select>

      <select value={filters.budget} onChange={(e) => onChange({ ...filters, budget: e.target.value as FiltersState["budget"] })}>
        <option value="any">Budget: Any</option>
        <option value="lt_2k">&lt; £2k</option>
        <option value="2k_5k">£2k-£5k</option>
        <option value="5k_10k">£5k-£10k</option>
        <option value="10k_plus">£10k+</option>
      </select>

      <select
        value={filters.officeType}
        onChange={(e) => onChange({ ...filters, officeType: e.target.value as FiltersState["officeType"] })}
      >
        <option value="any">Type: Any</option>
        <option value="serviced">Serviced</option>
        <option value="managed">Managed</option>
        <option value="coworking">Coworking</option>
      </select>

      <select
        value={filters.availability}
        onChange={(e) => onChange({ ...filters, availability: e.target.value as FiltersState["availability"] })}
      >
        <option value="any">Availability: Any</option>
        <option value="now">Now</option>
        <option value="next_3_months">Next 3 months</option>
        <option value="flexible">Flexible</option>
      </select>

      <label className="overlay-toggle">
        <input
          type="checkbox"
          checked={filters.vcOverlay}
          onChange={(e) => onChange({ ...filters, vcOverlay: e.target.checked })}
        />
        VC overlay
      </label>

      <label className="overlay-toggle">
        <input
          type="checkbox"
          checked={filters.techOverlay}
          onChange={(e) => onChange({ ...filters, techOverlay: e.target.checked })}
        />
        Tech overlay
      </label>
    </div>
  );
}
