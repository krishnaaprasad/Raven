import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const { file } = await req.json();

    if (!file) {
      return NextResponse.json(
        { error: "No file received" },
        { status: 400 }
      );
    }

    const uploaded = await cloudinary.uploader.upload(file, {
      folder: "raven-fragrance/products",
      transformation: [{ width: 800, height: 800, crop: "fill" }],
    });

    return NextResponse.json(
      {
        url: uploaded.secure_url,
        thumbnail: uploaded.eager?.[0]?.secure_url || uploaded.secure_url,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Upload Error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
