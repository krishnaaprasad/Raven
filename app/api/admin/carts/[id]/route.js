import connectToDatabase from "@/lib/mongodb";
import Cart from "@/models/Cart";

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    console.log("DELETE REQUEST FOR ID:", id);

    const result = await Cart.deleteOne({ _id: id });
    console.log("DELETE RESULT:", result);

    if (result.deletedCount === 0) {
      return Response.json({ success: false, message: "Cart not found or already deleted" });
    }

    return Response.json({ success: true, message: "Cart deleted successfully" });

  } catch (e) {
    console.error("Delete error:", e);
    return Response.json({ success: false, message: e.message });
  }
}
