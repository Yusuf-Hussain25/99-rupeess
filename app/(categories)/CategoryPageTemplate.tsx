import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Percent, Star } from 'lucide-react';
import { getCategoryContent, type CategoryListing } from './categoryData';

export type CategoryPageSearchParams = { loc?: string; city?: string; locName?: string };

type TemplateProps = {
  categoryKey: string;
  searchParams?: CategoryPageSearchParams;
};

const ListingCard = ({ listing }: { listing: CategoryListing }) => (
  <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
    <div className="relative h-60 w-full overflow-hidden">
      <Image
        src={listing.imageUrl}
        alt={listing.name}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Star className="h-4 w-4 text-yellow-300" />
          {listing.rating.toFixed(1)} · {listing.reviewCount}+ reviews
        </div>
        {listing.offerPercent && (
          <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur">
            <Percent className="h-3 w-3" />
            FLAT {listing.offerPercent}% OFF
          </div>
        )}
      </div>
    </div>
    <div className="flex flex-1 flex-col gap-3 px-5 py-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-900">{listing.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{listing.description}</p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
        {listing.priceLevel && (
          <span className="rounded-full bg-slate-100 px-3 py-1">{listing.priceLevel}</span>
        )}
        {listing.tags?.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <MapPin className="h-4 w-4 text-blue-500" />
          {listing.address}
        </span>
        <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
          View details
        </button>
      </div>
    </div>
  </article>
);

export default function CategoryPageTemplate({ categoryKey, searchParams }: TemplateProps) {
  const content = getCategoryContent(categoryKey);

  if (!content) {
    return notFound();
  }

  const locationName = searchParams?.city ?? searchParams?.locName ?? 'Patna';
  const activeLocation = searchParams?.loc ? `${locationName} · ID ${searchParams.loc}` : locationName;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-white shadow-xl">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at top, #ffffff33, transparent 40%)' }} />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">{content.subtitle}</p>
            <h1 className="text-3xl font-semibold md:text-4xl">Trending {content.title} in {locationName}</h1>
            <p className="max-w-2xl text-base text-white/80">{content.description}</p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white/80">
              <MapPin className="h-4 w-4 text-teal-300" />
              {activeLocation}
            </div>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to categories
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Featured spots</h2>
            <p className="text-sm text-slate-500">Hand-picked places based on reviews and offer value.</p>
          </div>
          <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:border-slate-900">
            Filter & Sort
          </button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {content.listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </div>
  );
}

