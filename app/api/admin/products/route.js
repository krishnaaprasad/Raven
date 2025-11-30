import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

// =====================
// GET /api/admin/products
// =====================
export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const q = searchParams.get("q") || "";
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const query = {
      ...(q && {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { slug: { $regex: q, $options: "i" } },
          { brand: { $regex: q, $options: "i" } },
        ],
      }),
      ...(!includeDeleted && { deleted: { $ne: true } }), // SHOW ALL non-deleted
    };

    const total = await Product.countDocuments(query);
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("GET products error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// =====================
// POST /api/admin/products 🚀 Create Product
// =====================
export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      name,
      slug,
      brand,
      description,
      images = [],
      benefits = [],
      variants = [],
      fragranceType,
      longevity,
      sillage,
      topNotes = [],
      heartNotes = [],
      baseNotes = [],
      ingredients = [],
    } = body;

    // Basic validation
    if (!name || !slug || variants.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, slug, and at least one variant are required",
          message: "Name, slug, and at least one variant are required",
        },
        { status: 400 }
      );
    }

    // Duplicate slug check
    const existing = await Product.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "A product with this slug already exists",
          message: "A product with this slug already exists",
        },
        { status: 400 }
      );
    }

    // Normalize variants
    const formattedVariants = variants.map((v) => ({
      size: v.size,
      price: Number(v.price),
      mrp: Number(v.mrp),
      stock: Number(v.stock) || 0,
        
    }));

    // Create product
    const newProduct = await Product.create({
      name,
      slug,
      brand,
      description,
      images,
      benefits,
      variants: formattedVariants,
      fragranceType,
      longevity,
      sillage,
      topNotes,
      heartNotes,
      baseNotes,
      ingredients,
      deleted: false, // SOFT DELETE
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST products error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Server error",
        message: err.message,
      },
      { status: 500 }
    );
  }
}

