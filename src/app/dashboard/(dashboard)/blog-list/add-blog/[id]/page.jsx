import AddBlogPage from "@/components/page/blog/addBlogPage";

export default async function EditBlog({params}) {
  const { id } = await params;
  return <AddBlogPage id={id} />;
}