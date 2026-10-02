import { WPPage } from "./types";

const WP_URL = process.env.WORDPRESS_KB_URL || "https://kb.softprowatersystems.com";

export async function fetchKBPages(): Promise<WPPage[]> {
  let allPages: WPPage[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${WP_URL}/wp-json/wp/v2/pages?per_page=${perPage}&page=${page}&status=publish`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'SoftPro-Playbook/1.0' } });
      
      if (!res.ok) {
        if (res.status === 400 && page > 1) {
          // Out of bounds, reached end
          break;
        }
        throw new Error(`WordPress API Error: ${res.status} ${res.statusText}`);
      }

      const data: WPPage[] = await res.json();
      if (data.length === 0) break;

      allPages = allPages.concat(data);
      
      const totalPagesHeader = res.headers.get("x-wp-totalpages");
      if (totalPagesHeader && page >= parseInt(totalPagesHeader)) {
        break;
      }
      
      page++;
    } catch (error) {
      console.error("Failed to fetch WordPress pages", error);
      throw error;
    }
  }

  return allPages;
}
