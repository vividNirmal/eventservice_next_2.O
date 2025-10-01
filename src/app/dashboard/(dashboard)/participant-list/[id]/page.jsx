import ParticipantUserListPage from "@/components/page/participantUser/participantUserListPage";


export default async function ParticipantUserList({ params }) {
  const { id } = await params;
  return <ParticipantUserListPage id={id} />;
}
