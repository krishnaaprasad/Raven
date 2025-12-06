import connectToDatabase from "@/lib/mongodb";
import Review from "@/models/Review";

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    await Review.findByIdAndUpdate(id, { deleted: true });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE review error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
