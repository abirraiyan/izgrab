import { InstagramPost } from "./Types";

export class InstagramService {
  static async fetchLatestPosts(): Promise<InstagramPost[]> {
    const response = await fetch("/api/instagram");
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to fetch Instagram feed: ${response.status} - ${errText}`);
    }
    const result = await response.json();
    const posts: InstagramPost[] = result.data || [];
    // Only return the latest 5 posts
    return posts.slice(0, 5);
  }
}
