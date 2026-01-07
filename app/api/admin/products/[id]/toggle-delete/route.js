import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

export async function PATCH(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const product = await Product.findById(id);
    product.deleted = !product.deleted;
    await product.save();

    // 🔥 FORCE LIVE SITE UPDATE
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${product.slug}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.log("toggle delete error", err);
    return NextResponse.json(
      { error: "Error updating product" },
      { status: 500 }
    );
  }
}
