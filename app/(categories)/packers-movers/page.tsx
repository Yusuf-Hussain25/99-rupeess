import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function PackersMoversPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="packers-movers" searchParams={searchParams} />;
}

