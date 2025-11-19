import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function WeddingPlanningPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="wedding-planning" searchParams={searchParams} />;
}

