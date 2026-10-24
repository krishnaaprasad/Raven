import connectToDatabase from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";

export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    // Normalise and validate; also rejects non-string values (e.g. {"$ne": null} query injection)
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
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
