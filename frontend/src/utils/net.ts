export async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (res.status !== 200) {
    throw new Error(`Received non-200 status code: ${res.status}`);
  }

  const json = await res.json();
  return json as T;
}

export async function getBackendJSON<T>(path: string): Promise<T> {
  return getJSON(`${process.env.BACKEND_URL}/${path}`);
}