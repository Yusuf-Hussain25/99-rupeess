import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function LoansPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="loans" searchParams={searchParams} />;
}

