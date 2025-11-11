import ExhibitorFormAssetList from "@/components/page/exhibitorFormAsset/ExhibitorFormAssetList";
import React from "react";

export default async function ExibitorFormAssetListPage({ params }) {
  const { id } = await params;
  return <ExhibitorFormAssetList eventId={id} />;
}

export const metadata = {
  title: 'Exhibitor Form Asset Management - Event Dashboard',
  description: 'Manage exhibitor form assets zone-wise for this event',
};