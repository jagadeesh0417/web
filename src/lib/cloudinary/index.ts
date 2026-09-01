import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const VIDEO_FOLDER = "akradhii/videos";
const PDF_FOLDER = "akradhii/pdfs";
const IMAGE_FOLDER = "akradhii/images";

export async function uploadVideo(
  file: Buffer,
  folder: string,
): Promise<{ publicId: string; url: string; duration: number }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: `${VIDEO_FOLDER}/${folder}`,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) reject(error);
        else if (result) {
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            duration: result.duration || 0,
          });
        } else {
          reject(new Error("Upload failed"));
        }
      },
    );
    uploadStream.end(file);
  });
}

export async function uploadPdf(
  file: Buffer,
  folder: string,
  filename: string,
): Promise<{ publicId: string; url: string; size: number }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: `${PDF_FOLDER}/${folder}`,
        public_id: filename,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) reject(error);
        else if (result) {
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            size: result.bytes || 0,
          });
        } else {
          reject(new Error("Upload failed"));
        }
      },
    );
    uploadStream.end(file);
  });
}

export async function uploadImage(
  file: Buffer,
  folder: string,
): Promise<{ publicId: string; url: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: `${IMAGE_FOLDER}/${folder}`,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) reject(error);
        else if (result) {
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
          });
        } else {
          reject(new Error("Upload failed"));
        }
      },
    );
    uploadStream.end(file);
  });
}

export async function deleteAsset(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function generateThumbnail(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    transformation: [
      { width: 640, height: 360, crop: "fill" },
      { start_offset: "10%" },
    ],
  });
}

export { cloudinary };
