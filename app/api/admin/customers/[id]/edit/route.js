import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name: body.name,
        phone: body.phone,
        address: body.address,
      },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json({ success: false, message: "User not found" });
    }

    return Response.json({
      success: true,
      user: updatedUser,
      message: "User updated successfully",
    });
  } catch (err) {
    return Response.json({ success: false, message: err.message });
  }
}
