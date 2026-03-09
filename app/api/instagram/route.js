export async function GET() {
  try {

    const url =
      "https://api.allorigins.win/raw?url=" +
      encodeURIComponent(
        "https://www.instagram.com/ravenfragrance.in/"
      );

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      next: { revalidate: 3600 },
    });

    const html = await res.text();

    const jsonMatch = html.match(/window\._sharedData = (.*?);<\/script>/);

    if (!jsonMatch) return Response.json([]);

    const data = JSON.parse(jsonMatch[1]);

    const posts =
      data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;

    const formatted = posts.slice(0, 12).map((post, index) => {

      const node = post.node;

      return {
        id: index,
        thumbnail: node.display_url,
        image: node.display_url,
        caption: node.edge_media_to_caption.edges?.[0]?.node?.text || "",
        instagramUrl: `https://www.instagram.com/p/${node.shortcode}/`,
        likes: node.edge_liked_by.count,
      };

    });

    return Response.json(formatted);

  } catch (error) {

    console.error("Instagram fetch error:", error);

    return Response.json([]);

  }
}