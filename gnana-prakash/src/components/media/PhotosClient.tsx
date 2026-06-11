"use client";
import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, Check, X, Loader2, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate, PHOTO_CATEGORIES } from "@/lib/utils";

interface SessionUser { role: string; [key: string]: any; }

async function fetchPhotos(params: Record<string, string>) {
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString();
  const res = await fetch(`/api/photos?${qs}`);
  return res.json();
}

export default function PhotosClient() {
  const [user, setUser] = useState<SessionUser | null>(null);
  useEffect(() => {
    fetch("/api/auth/custom-session").then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(console.error);
  }, []);
  const role = user?.role;
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [uploadProgram, setUploadProgram] = useState("");
  const [uploadCategory, setUploadCategory] = useState("VENUE");
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Record<string, any> | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["photos", { status, category, page }],
    queryFn: () => fetchPhotos({ status, category, page: String(page), limit: "20" }),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, action, remarks }: { id: string; action: string; remarks?: string }) => {
      const res = await fetch(`/api/photos/${id}/approve`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, remarks }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["photos"] }),
  });

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      if (uploadProgram) formData.append("program", uploadProgram);
      formData.append("category", uploadCategory);
      await fetch("/api/photos", { method: "POST", body: formData });
    }
    setUploading(false);
    qc.invalidateQueries({ queryKey: ["photos"] });
  }, [uploadProgram, uploadCategory, qc]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] }, maxSize: 10 * 1024 * 1024,
  });

  const STATUS_BADGE: Record<string, string> = {
    APPROVED: "success", PENDING: "warning", REJECTED: "destructive",
  };

  return (
    <div className="space-y-5">
      {/* Upload Zone */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Upload Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3 flex-wrap">
            <input placeholder="Program ID (optional)" className="h-9 rounded-lg border border-input bg-background px-3 text-sm flex-1 min-w-40"
              value={uploadProgram} onChange={e => setUploadProgram(e.target.value)} />
            <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
              {PHOTO_CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
            </select>
          </div>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-brand-500 bg-brand-50 dark:bg-brand-950/20" : "border-muted hover:border-brand-400 hover:bg-muted/30"}`}>
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="font-medium text-sm">{isDragActive ? "Drop files here" : "Drag & drop photos or click to browse"}</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 10MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {PHOTO_CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
        </select>
        <span className="text-sm text-muted-foreground">{data?.total || 0} photos</span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center h-40 items-center"><Loader2 className="w-6 h-6 animate-spin text-brand-600" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {data?.data?.map((photo: Record<string, any>) => (
            <div key={photo._id} className="group relative rounded-xl overflow-hidden border bg-muted aspect-square">
              <img src={photo.url} alt={photo.originalName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <Badge variant={(STATUS_BADGE[photo.status] || "secondary") as any} className="text-xs">{photo.status}</Badge>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setSelectedPhoto(photo)} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white">
                    <Eye className="w-4 h-4" />
                  </button>
                  {role && ["SUPER_ADMIN","DISTRICT_ADMIN"].includes(role) && photo.status === "PENDING" && (
                    <>
                      <button onClick={() => approveMutation.mutate({ id: photo._id, action: "approve" })}
                        className="p-1.5 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 text-white">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => approveMutation.mutate({ id: photo._id, action: "reject" })}
                        className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {data.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.originalName}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-3">
              <img src={selectedPhoto.url} alt={selectedPhoto.originalName} className="w-full rounded-xl max-h-96 object-contain bg-muted" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Category:</span> <span className="font-medium">{selectedPhoto.category}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={(STATUS_BADGE[selectedPhoto.status] || "secondary") as any} className="text-xs ml-1">{selectedPhoto.status}</Badge></div>
                <div><span className="text-muted-foreground">Uploaded by:</span> <span className="font-medium">{selectedPhoto.uploadedBy?.name}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{formatDate(selectedPhoto.uploadDate)}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
