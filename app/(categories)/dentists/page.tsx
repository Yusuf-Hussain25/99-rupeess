import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function DentistsPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="dentists" searchParams={searchParams} />;
}

