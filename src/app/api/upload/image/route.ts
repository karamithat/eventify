// app/api/upload/image/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { v2 as cloudinary } from "cloudinary";
// ✅ Cloudinary response tiplerini içe aktarın
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ] as const;
    if (!allowedTypes.includes(file.type as (typeof allowedTypes)[number])) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and GIF are allowed." },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ Promise'i UploadApiResponse ile tipleyin ve callback'i tipleyin
    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "events",
              transformation: [
                { width: 1170, height: 504, crop: "fill" },
                { quality: "auto" },
                { fetch_format: "auto" },
              ],
            },
            (
              error: UploadApiErrorResponse | undefined,
              result: UploadApiResponse | undefined
            ) => {
              if (error || !result) {
                return reject(error ?? new Error("Cloudinary upload failed"));
              }
              resolve(result);
            }
          )
          .end(buffer);
      }
    );

    // ❌ as any yok, doğrudan tipli `uploadResult` kullanıyoruz
    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
    });
  } catch (error: unknown) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Internal server error during image upload" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID is required" },
        { status: 400 }
      );
    }

    // cloudinary.uploader.destroy tipi zaten tanımlı (Promise döner)
    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
      result,
    });
  } catch (error: unknown) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Internal server error during image deletion" },
      { status: 500 }
    );
  }
}
