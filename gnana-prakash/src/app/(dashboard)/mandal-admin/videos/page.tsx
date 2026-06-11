import { Metadata } from "next";
import TopBar from "@/components/shared/TopBar";
import VideosClient from "@/components/media/VideosClient";
export const metadata: Metadata = { title: "Videos" };
export default function MandalVideosPage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Videos" subtitle="Upload training videos" />
      <div className="p-6"><VideosClient /></div>
    </div>
  );
}
