// app/api/merchant-feed/route.js

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  await connectToDatabase();

  const products = await Product.find({ deleted: { $ne: true } });

  const baseUrl = "https://www.ravenfragrance.in";

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
    <channel>
      <title>Raven Fragrance Products</title>
      <link>${baseUrl}</link>
      <description>Premium Long Lasting Perfumes</description>

      ${products
        .map((product) => {
          const image =
            product.images?.[0]?.original || product.images?.[0];

          const variant = product.variants?.[0];

          return `
            <item>
              <g:id>${product._id}</g:id>
              <g:title><![CDATA[${product.name}]]></g:title>
              <g:description><![CDATA[${
                product.metaDescription ||
product.shortDescription ||
product.description?.replace(/<[^>]*>?/gm, "") ||
product.name
              }]]></g:description>
              <g:link>${baseUrl}/product/${product.slug}</g:link>
              <g:image_link>${image}</g:image_link>
              <g:availability>in stock</g:availability>
              <g:price>${variant?.price} INR</g:price>
              <g:brand>Raven Fragrance</g:brand>
              <g:condition>new</g:condition>
            </item>
          `;
        })
        .join("")}

    </channel>
  </rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}