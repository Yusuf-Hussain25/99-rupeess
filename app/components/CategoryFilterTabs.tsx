'use client';

type FilterType = 'nearby' | 'popular' | 'top-rated';

type CategoryFilterTabsProps = {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts?: { nearby?: number; popular?: number; 'top-rated'?: number };
};

const filters: { id: FilterType; label: string; icon: string }[] = [
  { id: 'nearby', label: 'Nearby', icon: '📍' },
  { id: 'popular', label: 'Popular', icon: '🔥' },
  { id: 'top-rated', label: 'Top Rated', icon: '⭐' },
];

export default function CategoryFilterTabs({ activeFilter, onFilterChange, counts }: CategoryFilterTabsProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-wrap gap-2 sm:gap-3 bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg border border-gray-100">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          const count = counts?.[filter.id];
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                relative flex-1 flex items-center justify-center gap-2
                px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold
                transition-all duration-300 ease-in-out
                min-w-[120px] sm:min-w-[140px]
                ${
                  isActive
                    ? 'bg-custom-gradient text-white shadow-lg scale-105 z-10'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-amber-600 hover:scale-[1.02]'
                }
              `}
            >
              <span className="text-base sm:text-lg">{filter.icon}</span>
              <span className="text-sm sm:text-base">{filter.label}</span>
              {count !== undefined && count > 0 && (
                <span className={`
                  ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold
                  transition-all duration-300
                  ${
                    isActive
                      ? 'bg-white/30 text-white backdrop-blur-sm'
                      : 'bg-gray-200 text-gray-700'
                  }
                `}>
                  {count}
                </span>
              )}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-white rounded-full shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { FilterType };

