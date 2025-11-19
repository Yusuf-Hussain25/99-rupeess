import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function HospitalsPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="hospitals" searchParams={searchParams} />;
}

