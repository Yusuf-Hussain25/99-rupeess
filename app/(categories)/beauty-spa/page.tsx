import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function BeautySpaPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="beauty-spa" searchParams={searchParams} />;
}

