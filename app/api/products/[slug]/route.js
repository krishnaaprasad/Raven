import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req, context) {
  try {
    await connectToDatabase();
    const { slug } = await context.params; // ✅ must await this now

    const product = await Product.findOne({ slug });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
