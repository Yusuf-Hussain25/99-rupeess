import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function HotelsPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="hotels" searchParams={searchParams} />;
}

