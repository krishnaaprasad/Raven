import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import StockLog from "@/models/StockLog";

export async function POST(req) {
  try {
    await connectToDatabase();

    const { productId, variantSize, adjustment, type, reason } =
      await req.json();

    // Validation
    if (!productId || !variantSize || adjustment === undefined || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: productId, variantSize, adjustment, type" },
        { status: 400 }
      );
    }

    const validTypes = ["RESTOCK", "DAMAGE", "RETURN", "CORRECTION"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const adjustmentNum = Number(adjustment);
    if (!Number.isFinite(adjustmentNum) || adjustmentNum === 0) {
      return NextResponse.json(
        { success: false, error: "Adjustment must be a non-zero number" },
        { status: 400 }
      );
    }

    // Find the product and current variant stock
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const variant = product.variants.find(
      (v) => String(v.size) === String(variantSize)
    );
    if (!variant) {
      return NextResponse.json(
        { success: false, error: "Variant not found" },
        { status: 404 }
      );
    }

    const previousStock = variant.stock;

    // If negative adjustment, ensure stock won't go below 0
    if (adjustmentNum < 0 && previousStock < Math.abs(adjustmentNum)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot reduce stock below 0. Current stock: ${previousStock}, adjustment: ${adjustmentNum}`,
        },
        { status: 400 }
      );
    }

    // Atomic update
    const filter =
      adjustmentNum < 0
        ? {
            _id: productId,
            "variants.size": variantSize,
            "variants.stock": { $gte: Math.abs(adjustmentNum) },
          }
        : {
            _id: productId,
            "variants.size": variantSize,
          };

    const updated = await Product.findOneAndUpdate(
      filter,
      { $inc: { "variants.$.stock": adjustmentNum } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Stock update failed — insufficient stock or product not found" },
        { status: 400 }
      );
    }

    const updatedVariant = updated.variants.find(
      (v) => String(v.size) === String(variantSize)
    );
    const newStock = updatedVariant?.stock ?? previousStock + adjustmentNum;

    // Log the adjustment
    await StockLog.create({
      productId: product._id,
      variantSize,
      type,
      quantity: adjustmentNum,
      previousStock,
      newStock,
      reason: reason || null,
      by: "admin",
    });

    return NextResponse.json({
      success: true,
      productId: product._id,
      variantSize,
      previousStock,
      newStock,
      adjustment: adjustmentNum,
      type,
    });
  } catch (error) {
    console.error("❌ Stock adjust error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
