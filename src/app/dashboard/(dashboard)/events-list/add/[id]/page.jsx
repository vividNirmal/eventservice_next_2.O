import AddEvents from "@/components/page/registerEvent/addEvents";

export default async function page({params}) {
  const { id } = await params;
  return <AddEvents id={id}/>;
}
