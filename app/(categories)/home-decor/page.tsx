import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function HomeDecorPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="home-decor" searchParams={searchParams} />;
}

