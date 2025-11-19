import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function CourierServicePage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="courier-service" searchParams={searchParams} />;
}

