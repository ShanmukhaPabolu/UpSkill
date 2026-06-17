"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Upload, Image as ImageIcon, Check, X, Loader2, Eye, Filter, 
  Search, SlidersHorizontal, Calendar, User, Building, Trash2, 
  CheckCircle, AlertTriangle, Sparkles, FolderHeart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, PHOTO_CATEGORIES } from "@/lib/utils";

interface SessionUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
}

export default function PhotosClient() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [activeTab, setActiveTab] = useState<"gallery" | "upload" | "approvals">("gallery");

  // Gallery view controls
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [programFilter, setProgramFilter] = useState("ALL");
  const [selectedPhoto, setSelectedPhoto] = useState<Record<string, any> | null>(null);

  // Upload Form controls
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState(PHOTO_CATEGORIES[0] || "Other Activities");
  const [uploadProgramId, setUploadProgramId] = useState("");
  const [uploadPlatform, setUploadPlatform] = useState("Gnana Prakash");
  const [uploadDepartment, setUploadDepartment] = useState("School Education");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Approval panel controls
  const [approvalRemarks, setApprovalRemarks] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  // Fetch session
  useEffect(() => {
    fetch("/api/auth/custom-session")
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user); })
      .catch(console.error);
  }, []);

  const userRole = user?.role || "TEACHER";
  const userEmail = user?.email || "";
  const isAdmin = ["SUPER_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN", "MANDAL_ADMIN", "VENUE_ADMIN"].includes(userRole);

  // Fetch programs for select dropdown (Admins get all, Teachers get enrolled)
  const { data: adminProgramsData } = useQuery({
    queryKey: ["programs_list_media", isAdmin],
    queryFn: async () => {
      const res = await fetch("/api/programs?limit=100");
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: teacherProgramsData } = useQuery({
    queryKey: ["teacher_programs_list_media", userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const res = await fetch(`/api/attendance/participants?email=${userEmail}`);
      return res.json();
    },
    enabled: !isAdmin && !!userEmail,
  });

  const programsOptions = isAdmin 
    ? (adminProgramsData?.data || []) 
    : (teacherProgramsData?.data || []).map((p: any) => ({
        _id: p.programId,
        programName: p.programName
      }));

  // Fetch Approved Photos
  const { data: approvedPhotos, isLoading: isLoadingApproved } = useQuery({
    queryKey: ["photos_approved", searchQuery, categoryFilter, platformFilter, programFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ status: "APPROVED", limit: "48" });
      if (searchQuery) params.set("search", searchQuery);
      if (categoryFilter && categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (platformFilter && platformFilter !== "ALL") params.set("platform", platformFilter);
      if (programFilter && programFilter !== "ALL") params.set("program", programFilter);
      
      const res = await fetch(`/api/photos?${params.toString()}`);
      return res.json();
    }
  });

  // Fetch Pending Photos (Admins only)
  const { data: pendingPhotos, isLoading: isLoadingPending } = useQuery({
    queryKey: ["photos_pending"],
    queryFn: async () => {
      const res = await fetch("/api/photos?status=PENDING&limit=100");
      return res.json();
    },
    enabled: isAdmin,
  });

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("Image size exceeds the 10MB limit.");
        return;
      }
      setSelectedFile(file);
      setUploadError("");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Upload Form
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("Please select an image file to upload.");
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError("Please enter a title for this image.");
      return;
    }
    if (!uploadProgramId) {
      setUploadError("Please associate this image with a training program.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", uploadTitle);
      formData.append("description", uploadDescription);
      formData.append("category", uploadCategory);
      formData.append("program", uploadProgramId);
      formData.append("platform", uploadPlatform);
      formData.append("department", uploadDepartment);

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      setUploadSuccess(true);
      setUploadTitle("");
      setUploadDescription("");
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Invalidate queries to reload gallery
      qc.invalidateQueries({ queryKey: ["photos_approved"] });
      if (isAdmin) qc.invalidateQueries({ queryKey: ["photos_pending"] });
    } catch (err: any) {
      setUploadError(err.message || "Something went wrong.");
    } finally {
      setIsUploading(false);
    }
  };

  // Approve / Reject Mutations
  const actionMutation = useMutation({
    mutationFn: async ({ id, action, remarks }: { id: string; action: "approve" | "reject"; remarks?: string }) => {
      const res = await fetch(`/api/photos/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, remarks: remarks || "" })
      });
      if (!res.ok) throw new Error("Approval action failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["photos_approved"] });
      qc.invalidateQueries({ queryKey: ["photos_pending"] });
      alert("Status updated successfully.");
    },
    onError: (err) => {
      alert("Error taking action: " + err.message);
    }
  });

  // Delete Photo Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/photos/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["photos_approved"] });
      qc.invalidateQueries({ queryKey: ["photos_pending"] });
      setSelectedPhoto(null);
      alert("Image deleted successfully.");
    },
    onError: (err) => {
      alert("Error deleting image: " + err.message);
    }
  });

  // Fetch unique platforms list for filtering
  const platformsList = ["Gnana Prakash", "School Education", "SS Office", "DEO Office"];

  return (
    <div className="space-y-6">
      {/* Tabs Selection */}
      <div className="flex border-b border-slate-200 gap-1 bg-slate-50/50 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("gallery")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "gallery"
              ? "bg-white shadow-sm border border-slate-100 text-brand-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Gallery Feed
        </button>

        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "upload"
              ? "bg-white shadow-sm border border-slate-100 text-brand-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Upload className="w-4 h-4" /> {isAdmin ? "Direct Upload" : "Submit Request"}
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab("approvals")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === "approvals"
                ? "bg-white shadow-sm border border-slate-100 text-brand-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Approval Panel
            {pendingPhotos?.total > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white w-4.5 h-4.5 rounded-full text-[9px] flex items-center justify-center font-bold">
                {pendingPhotos.total}
              </span>
            )}
          </button>
        )}
      </div>

      {/* GALLERY TAB */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          {/* Controls Panel */}
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    placeholder="Search by Title, Desc, Program..."
                    className="h-9 pl-9 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter Category */}
                <select
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  {PHOTO_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Filter Platform */}
                <select
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none"
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                >
                  <option value="ALL">All Platforms</option>
                  {platformsList.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                {/* Filter Program */}
                <select
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none"
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                >
                  <option value="ALL">All Programs</option>
                  {programsOptions.map((prog: any) => (
                    <option key={prog._id} value={prog._id}>
                      {prog.programName}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Grid Layout */}
          {isLoadingApproved ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-brand-600" /></div>
          ) : !approvedPhotos?.data?.length ? (
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
                <ImageIcon className="w-12 h-12 mb-3 opacity-20 text-brand-600" />
                <p className="font-semibold text-slate-700">No Images Available</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                  There are no approved images matching these filter criteria, or none have been uploaded yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {approvedPhotos.data.map((photo: any) => (
                <div 
                  key={photo._id} 
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
                    <p className="text-[10px] font-bold text-brand-400 uppercase tracking-wide">{photo.category}</p>
                    <p className="font-semibold text-xs truncate leading-snug">{photo.title}</p>
                    <p className="text-[9px] text-slate-300 truncate leading-none mt-1">{photo.program?.programName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* UPLOAD REQUEST / DIRECT UPLOAD TAB */}
      {activeTab === "upload" && (
        <Card className="border-slate-100 shadow-sm max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              {isAdmin ? "Direct Image Upload" : "Submit Image Request"}
            </CardTitle>
            <CardDescription>
              {isAdmin 
                ? "Upload images directly to the live image gallery. These will bypass approval."
                : "Submit an image request. It will remain in a pending state until approved by an administrator."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {uploadError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Upload submitted successfully! {isAdmin ? "Visible in gallery." : "Pending review."}</span>
                </div>
              )}

              {/* File Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition-colors hover:bg-slate-50/50 flex flex-col items-center justify-center gap-2"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {filePreview ? (
                  <div className="relative w-40 h-40 rounded-xl overflow-hidden border">
                    <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Click to upload or drag & drop</p>
                      <p className="text-[10px] text-slate-400 mt-1">Supported formats: JPG, PNG, WebP up to 10MB</p>
                    </div>
                  </>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Image Title *</Label>
                  <Input 
                    placeholder="Enter image title" 
                    className="h-9 text-xs" 
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Category *</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                  >
                    {PHOTO_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Program Link *</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none"
                  value={uploadProgramId}
                  onChange={(e) => setUploadProgramId(e.target.value)}
                >
                  <option value="">-- Choose training program --</option>
                  {programsOptions.map((p: any) => (
                    <option key={p._id} value={p._id}>{p.programName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Platform/Department</Label>
                  <Input 
                    placeholder="Platform e.g. Gnana Prakash" 
                    className="h-9 text-xs" 
                    value={uploadPlatform}
                    onChange={(e) => setUploadPlatform(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Department/Office</Label>
                  <Input 
                    placeholder="Department e.g. School Education" 
                    className="h-9 text-xs" 
                    value={uploadDepartment}
                    onChange={(e) => setUploadDepartment(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Image Description</Label>
                <Textarea 
                  placeholder="Enter short description or context of training program..." 
                  className="text-xs min-h-[80px]"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-3">
                <Button 
                  type="submit" 
                  disabled={isUploading} 
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold h-10 px-8"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  {isAdmin ? "Publish Directly" : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* PENDING APPROVALS TAB (Admins only) */}
      {activeTab === "approvals" && isAdmin && (
        <div className="space-y-6">
          {isLoadingPending ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-brand-600" /></div>
          ) : !pendingPhotos?.data?.length ? (
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
                <CheckCircle className="w-12 h-12 mb-3 opacity-20 text-emerald-600" />
                <p className="font-semibold text-slate-700">No Pending Requests</p>
                <p className="text-xs text-slate-400 mt-1">
                  All submitted image requests have been processed. Great job!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingPhotos.data.map((photo: any) => (
                <Card key={photo._id} className="border-slate-100 shadow-sm overflow-hidden flex flex-col">
                  {/* Image Container */}
                  <div className="relative h-64 bg-slate-50 border-b border-slate-100">
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-contain" />
                    <Badge className="absolute top-3 right-3 bg-amber-600 text-white font-bold uppercase tracking-wider text-[9px]">
                      Pending Review
                    </Badge>
                  </div>

                  {/* Metadata and Review Panel */}
                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Badge variant="outline" className="text-[9px] font-bold text-brand-600 uppercase border-brand-200">
                          {photo.category}
                        </Badge>
                        <h3 className="font-bold text-base text-slate-900 leading-snug mt-1">{photo.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{photo.description || "No description provided."}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-50 pt-3">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Program</p>
                          <p className="font-semibold text-slate-800 truncate">{photo.program?.programName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Uploaded By</p>
                          <p className="font-semibold text-slate-800 truncate flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {photo.uploadedBy?.name || "User"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Platform/Dept</p>
                          <p className="font-semibold text-slate-800 truncate">{photo.platform || "Gnana Prakash"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Date Submitted</p>
                          <p className="font-semibold text-slate-800 truncate">{formatDate(photo.uploadDate)}</p>
                        </div>
                      </div>

                      {/* Approval Remarks Input */}
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Review Remarks (Optional)</Label>
                        <Input 
                          placeholder="e.g. Approved for gallery publication"
                          className="h-8 text-xs"
                          value={approvalRemarks[photo._id] || ""}
                          onChange={(e) => setApprovalRemarks(prev => ({
                            ...prev,
                            [photo._id]: e.target.value
                          }))}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                      <Button
                        size="sm"
                        onClick={() => actionMutation.mutate({ 
                          id: photo._id, 
                          action: "approve",
                          remarks: approvalRemarks[photo._id]
                        })}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => actionMutation.mutate({ 
                          id: photo._id, 
                          action: "reject",
                          remarks: approvalRemarks[photo._id]
                        })}
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold h-9 gap-1.5"
                      >
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL PREVIEW DIALOG */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl overflow-hidden rounded-2xl border-none p-0 shadow-2xl">
          {selectedPhoto && (
            <div className="flex flex-col md:flex-row h-full">
              {/* Image box */}
              <div className="md:w-[55%] bg-slate-900 flex items-center justify-center min-h-[300px] md:max-h-[500px]">
                <img 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.title} 
                  className="max-w-full max-h-[500px] object-contain"
                />
              </div>

              {/* Meta details side-pane */}
              <div className="md:w-[45%] p-6 flex flex-col justify-between space-y-6 bg-white">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge className="bg-brand-600 text-white font-bold text-[9px] uppercase tracking-wider">
                        {selectedPhoto.category}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] font-bold text-slate-500 border-slate-200">
                        {selectedPhoto.platform}
                      </Badge>
                    </div>
                    <DialogTitle className="text-lg font-bold text-slate-900 leading-snug">
                      {selectedPhoto.title}
                    </DialogTitle>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {selectedPhoto.description || "No description provided."}
                    </p>
                  </div>

                  <div className="space-y-3.5 border-t border-slate-100 pt-4 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Building className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Program Link</p>
                        <p className="font-semibold text-slate-700 leading-snug">{selectedPhoto.program?.programName || "Unknown Program"}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Timeline: {selectedPhoto.program?.trainingYear || "Year 3"} | {selectedPhoto.program?.department || "School Education"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <User className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uploaded By</p>
                        <p className="font-semibold text-slate-700">{selectedPhoto.uploadedBy?.name || "Anonymous"}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Role: {selectedPhoto.uploadedBy?.role?.replace("_", " ") || "TEACHER"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload Date</p>
                        <p className="font-semibold text-slate-700">{formatDate(selectedPhoto.uploadDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admins can delete directly from preview */}
                {isAdmin && (
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(selectedPhoto._id)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold gap-1 text-xs"
                    >
                      <Trash2 className="w-4 h-4" /> Remove Image
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
