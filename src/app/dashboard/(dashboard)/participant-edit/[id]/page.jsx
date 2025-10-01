import UpdateParticipantUserPage from "@/components/page/participantUser/updateParticipantUserPage";


export default async function UpdateParticipantUser({ params }) {
  const { id } = await params;
  return <UpdateParticipantUserPage id={id} />;
}
