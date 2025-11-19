import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function PetShopsPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="pet-shops" searchParams={searchParams} />;
}

