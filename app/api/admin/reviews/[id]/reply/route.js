import connectToDatabase from "@/lib/mongodb";
import Review from "@/models/Review";

export async function PUT(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { reply } = await req.json();

    if (!reply) {
      return Response.json({ message: "Reply is required" }, { status: 400 });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { reply, replyAt: new Date() },
      { new: true }
    );

    return Response.json(review, { status: 200 });
  } catch (error) {
    console.error("Reply update error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
