import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function RestaurantsPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="restaurants" searchParams={searchParams} />;
}

