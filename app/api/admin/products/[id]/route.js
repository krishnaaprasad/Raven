// app/api/admin/products/[id]/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

// GET /api/admin/products/[id]  → single product for Edit page
export async function GET(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const product = await Product.findById(id).lean();
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    console.error("GET product by id error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/products/[id]
// - If body = { deleted: true/false } → soft delete only
// - Otherwise → full update (edit form)
export async function PATCH(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // 🟡 Soft delete only
    if (
      Object.keys(body).length === 1 &&
      Object.prototype.hasOwnProperty.call(body, "deleted")
    ) {
      product.deleted = !!body.deleted;
      await product.save();

      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath(`/product/${product.slug}`);

      return NextResponse.json({
        success: true,
        data: product,
        message: body.deleted
          ? "Product soft-deleted successfully"
          : "Product restored successfully",
      });
    }

    // 🟠 Full update from Edit Product form
    const {
      name,
      slug,
      brand,
      description,
      images,
      benefits,
      variants,
      fragranceType,
      longevity,
      sillage,
      topNotes,
      heartNotes,
      baseNotes,
      ingredients,
    } = body;

    if (!name || !slug || !variants || variants.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, slug, and at least one variant are required",
        },
        { status: 400 }
      );
    }

    // If slug changed, ensure uniqueness
    if (slug !== product.slug) {
      const existing = await Product.findOne({ slug });
      if (existing && existing._id.toString() !== id) {
        return NextResponse.json(
          {
            success: false,
            message: "Another product with this slug already exists",
          },
          { status: 400 }
        );
      }
    }

    // Normalize variants
    const formattedVariants = (variants || []).map((v) => ({
      size: v.size,
      price: Number(v.price),
      mrp: Number(v.mrp),
      stock: Number(v.stock) || 0,
    }));

    product.name = name;
    product.slug = slug;
    product.brand = brand || "";
    product.description = description || "";
    product.images = images || [];
    product.benefits = benefits || [];
    product.variants = formattedVariants;
    product.fragranceType = fragranceType || "";
    product.longevity = longevity || "";
    product.sillage = sillage || "";
    product.topNotes = topNotes || [];
    product.heartNotes = heartNotes || [];
    product.baseNotes = baseNotes || [];
    product.ingredients = ingredients || [];
    // keep product.deleted as-is

    const updated = await product.save();

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Product updated successfully",
    });
  } catch (err) {
    console.error("PATCH product error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
