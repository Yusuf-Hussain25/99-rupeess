import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function RentHirePage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="rent-hire" searchParams={searchParams} />;
}

