import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function EstateAgentPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="estate-agent" searchParams={searchParams} />;
}

