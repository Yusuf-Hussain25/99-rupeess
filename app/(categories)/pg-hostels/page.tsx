import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function PgHostelsPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="pg-hostels" searchParams={searchParams} />;
}

