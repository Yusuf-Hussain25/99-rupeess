import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function GymPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="gym" searchParams={searchParams} />;
}

