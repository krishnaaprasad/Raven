import connectToDatabase from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";

export async function POST(req) {
  try {
    await connectToDatabase();

    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return Response.json(
        { message: "Valid email is required" },
        { status: 400 }
      );
    }

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return Response.json(
        { message: "You are already subscribed" },
        { status: 409 }
      );
    }

    await Newsletter.create({ email });

    return Response.json(
      { message: "Subscribed successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Newsletter error:", err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
