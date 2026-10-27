// app/api/admin/products/[id]/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import StockLog from "@/models/StockLog";
import { normalizeVariant } from "@/lib/productVariants";

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
      revalidatePath("/collection");
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
      accords = [],
      isComingSoon,
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

    // Normalize variants (keeps cost fields). Stock for an existing size is applied as the
    // CHANGE the admin made in the form (stock − stockLoaded) on top of the live value, so
    // orders placed while the form was open aren't undone by a stale number.
    // The write is conditional on every variant's stock still being what we read (sales /
    // adjustments in between → re-read and recompute), and the product update + its stock
    // logs commit together in one transaction.
    const fields = {
      name,
      slug,
      brand: brand || "",
      description: description || "",
      images: images || [],
      benefits: benefits || [],
      fragranceType: fragranceType || "",
      longevity: longevity || "",
      sillage: sillage || "",
      topNotes: topNotes || [],
      heartNotes: heartNotes || [],
      baseNotes: baseNotes || [],
      ingredients: ingredients || [],
      accords: accords || [],
      isComingSoon: isComingSoon !== undefined ? Boolean(isComingSoon) : product.isComingSoon,
    };

    let updated = null;
    for (let attempt = 0; attempt < 3 && !updated; attempt++) {
      const fresh = attempt === 0 ? product : await Product.findById(id).lean();
      if (!fresh) {
        return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
      }

      const stockChanges = [];
      const formattedVariants = [];
      for (const v of variants) {
        const next = normalizeVariant(v);
        const live = fresh.variants.find((pv) => String(pv.size) === next.size);
        const liveStock = Number(live?.stock || 0);
        const loaded = Number(v.stockLoaded);
        if (live && Number.isFinite(loaded)) {
          const delta = next.stock - loaded;
          if (liveStock + delta < 0) {
            return NextResponse.json(
              {
                success: false,
                message: `${next.size}: only ${liveStock} left now, can't reduce by ${-delta}. Reload the page and try again.`,
              },
              { status: 409 }
            );
          }
          next.stock = liveStock + delta;
        }
        if (live && next.stock !== liveStock) {
          stockChanges.push({ size: next.size, from: liveStock, to: next.stock });
        }
        formattedVariants.push(next);
      }

      // Only write if no variant's stock moved since `fresh` was read
      const guard = fresh.variants.map((pv) => ({ $elemMatch: { size: pv.size, stock: pv.stock } }));
      const filter = guard.length ? { _id: id, variants: { $all: guard } } : { _id: id };

      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          updated = await Product.findOneAndUpdate(
            filter,
            { $set: { ...fields, variants: formattedVariants } },
            { new: true, runValidators: true, session }
          );
          if (!updated) return; // stock changed meanwhile → retry with fresh values
          if (stockChanges.length) {
            await StockLog.insertMany(
              stockChanges.map((c) => ({
                productId: updated._id,
                variantSize: c.size,
                type: "CORRECTION",
                quantity: c.to - c.from,
                previousStock: c.from,
                newStock: c.to,
                reason: "Edited on product page",
                by: "admin",
              })),
              { session }
            );
          }
        });
      } finally {
        await session.endSession();
      }
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Stock changed while saving (orders coming in). Please try again." },
        { status: 409 }
      );
    }

    // Refresh cached storefront pages for this product
    revalidatePath("/");
    revalidatePath("/collection");
    revalidatePath(`/product/${updated.slug}`);

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
