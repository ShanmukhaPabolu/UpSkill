import { Metadata } from "next";
import TopBar from "@/components/shared/TopBar";
import PhotosClient from "@/components/media/PhotosClient";

export const metadata: Metadata = { title: "Image Gallery" };

export default function ImageGalleryPage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Image Gallery" subtitle="View and share training workshop moments" />
      <div className="p-6">
        <PhotosClient />
      </div>
    </div>
  );
}
