import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function DrivingSchoolsPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="driving-schools" searchParams={searchParams} />;
}

