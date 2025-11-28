import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function PATCH(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const product = await Product.findById(id);
    product.deleted = !product.deleted;
    await product.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.log("toggle delete error", err);
    return NextResponse.json({ error: "Error updating product" }, { status: 500 });
  }
}
