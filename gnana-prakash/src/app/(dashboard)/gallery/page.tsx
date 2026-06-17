import { Metadata } from "next";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import TopBar from "@/components/shared/TopBar";
import PhotosClient from "@/components/media/PhotosClient";

export const metadata: Metadata = { title: "Image Gallery" };

export default async function ImageGalleryPage() {
  const cookieStore = await cookies();
  const tokenCookie =
    cookieStore.get("__Secure-next-auth.session-token") ||
    cookieStore.get("next-auth.session-token");

  let isSuperAdmin = false;
  if (tokenCookie?.value) {
    try {
      const token = await decode({
        token: tokenCookie.value,
        secret: process.env.NEXTAUTH_SECRET!,
        salt: tokenCookie.name,
      });
      if (token?.role === "SUPER_ADMIN") {
        isSuperAdmin = true;
      }
    } catch (e) {
      console.error("Error decoding token in gallery page:", e);
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar 
        title="Image Gallery" 
        subtitle="View and share training workshop moments" 
        showSearch={!isSuperAdmin}
        showBell={!isSuperAdmin}
      />
      <div className="p-6">
        <PhotosClient />
      </div>
    </div>
  );
}
