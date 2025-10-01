// lib/getMetaDetails.ts
export async function getMetaDetails(type, slug, currentUrl) {
  const form = new FormData();
  form.append("type", type);
  form.append("slug", slug);
  form.append("current_url", currentUrl);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get-server-side-metadetails`, {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error("Failed to fetch meta:", err);
    return null;
  }
}
