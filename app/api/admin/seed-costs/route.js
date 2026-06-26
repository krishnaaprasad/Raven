import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import BusinessConfig from "@/models/BusinessConfig";

// POST /api/admin/seed-costs
// One-time endpoint to seed product costs and capital investment from Excel data.
// Safe to run multiple times (idempotent — updates existing values).
export async function POST() {
  try {
    await connectToDatabase();

    // SKU cost data from Raven Tracker Excel
    const skuCosts = {
      rebel: { oil_cost: 376, packaging_cost: 90, other_cost: 0, total_cost: 466 },
      mystique: { oil_cost: 363, packaging_cost: 90, other_cost: 0, total_cost: 453 },
      oligarch: { oil_cost: 480, packaging_cost: 90, other_cost: 0, total_cost: 570 },
      "oud-intense": { oil_cost: 445, packaging_cost: 90, other_cost: 0, total_cost: 535 },
      lucifer: { oil_cost: 423, packaging_cost: 90, other_cost: 0, total_cost: 513 },
    };

    const results = [];

    for (const [slug, costs] of Object.entries(skuCosts)) {
      const product = await Product.findOne({ slug });
      if (!product) {
        results.push({ slug, status: "not_found" });
        continue;
      }

      // Update all variants with the same cost (since all are 50ml)
      let updated = false;
      for (const variant of product.variants) {
        variant.oil_cost = costs.oil_cost;
        variant.packaging_cost = costs.packaging_cost;
        variant.other_cost = costs.other_cost;
        variant.total_cost = costs.total_cost;
        updated = true;
      }

      if (updated) {
        await product.save();
        results.push({ slug, status: "updated", variants: product.variants.length });
      }
    }

    // Seed capital invested
    await BusinessConfig.findOneAndUpdate(
      { key: "capital_invested" },
      { key: "capital_invested", value: 143450 },
      { upsert: true }
    );

    // Seed founders
    await BusinessConfig.findOneAndUpdate(
      { key: "founders" },
      {
        key: "founders",
        value: [
          { name: "Nikhil", amount: 37450 },
          { name: "Sonali", amount: 0 },
          { name: "Abhi", amount: 41000 },
          { name: "Prathamesh", amount: 65000 },
        ],
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Costs and capital seeded successfully",
      products: results,
      capitalInvested: 143450,
    });
  } catch (err) {
    console.error("Seed costs error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
