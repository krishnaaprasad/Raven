import connectToDatabase from "@/lib/mongodb";
import Review from "@/models/Review";

export async function PUT(req, { params }) {
  await connectToDatabase();
  const { id } = await params;

  await Review.findByIdAndUpdate(id, { deleted: false });

  return Response.json({ success: true }, { status: 200 });
}
