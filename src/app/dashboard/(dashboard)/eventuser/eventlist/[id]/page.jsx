import CategoryEventList from "@/components/page/EventUsersPages/EventList/CategoryEventList";

export default async function page({ params }) {
  const { id } = await params;
  return <CategoryEventList id={id} />;
}
