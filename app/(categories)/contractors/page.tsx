import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function ContractorsPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="contractors" searchParams={searchParams} />;
}

