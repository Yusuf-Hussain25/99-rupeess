import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function EducationPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="education" searchParams={searchParams} />;
}

