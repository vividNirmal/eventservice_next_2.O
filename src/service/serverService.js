export async function getRequest(path) {
  const baseURL =process.env.NEXT_PUBLIC_API_BASE_URL;  
  
  return fetch(`${baseURL}/${path}`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return false;
      }
    })
    .catch(() => false);
}


