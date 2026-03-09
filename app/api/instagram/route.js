export async function GET() {
  try {

    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      return Response.json(
        { error: "Missing INSTAGRAM_ACCESS_TOKEN environment variable", data: [] },
        { status: 500 }
      );
    }

    const fields = "id,caption,media_url,thumbnail_url,permalink";
    const limit = 12;
    const apiUrl = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${accessToken}&limit=${limit}`;

    const res = await fetch(apiUrl, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error("Instagram API error:", res.status, errorText);
      return Response.json(
        { error: "Instagram API request failed", status: res.status, data: [] },
        { status: res.status }
      );
    }

    const data = await res.json();
    const posts = Array.isArray(data?.data) ? data.data : [];

    const formatted = posts.slice(0, 12).map((post, index) => ({
      id: post.id ?? index,
      thumbnail: post.thumbnail_url ?? post.media_url ?? "",
      image: post.media_url ?? post.thumbnail_url ?? "",
      caption: post.caption ?? "",
      instagramUrl: post.permalink ?? "",
      likes: null,
    }));

    return Response.json(formatted);

  } catch (error) {

    console.error("Instagram fetch error:", error);

    return Response.json({ error: "Instagram fetch exception", data: [] }, { status: 500 });

  }
}