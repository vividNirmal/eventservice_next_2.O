// // components/SEO/JsonLdScript.js
// export default function JsonLdScript({ data, id }) {
//   if (!data) return null;

//   return (
//     <script
//       type="application/ld+json"
//       id={id}
//       dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
//     />
//   );
// }



"use client";
import { useEffect } from "react";

export default function JsonLdScript({ data, id }) {
  useEffect(() => {
    if (!data || !id) return;

    // Remove existing script with same ID if it exists
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.innerHTML = JSON.stringify(data);
    document.head.appendChild(script);

    // Clean up when unmounted or ID/data changes
    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data, id]);

  return null;
}
