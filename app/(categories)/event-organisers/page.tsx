import CategoryPageTemplate, { CategoryPageSearchParams } from '../CategoryPageTemplate';

type PageProps = {
  searchParams?: CategoryPageSearchParams;
};

export default function EventOrganisersPage({ searchParams }: PageProps) {
  return <CategoryPageTemplate categoryKey="event-organisers" searchParams={searchParams} />;
}

