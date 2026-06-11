"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "STUDENT",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Registration failed.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 shadow-sm border border-emerald-100 mb-6">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Registration Submitted!</h2>
        <p className="text-slate-600 mb-8">
          Your request has been securely routed to the Super Admin for approval. You will not be able to login until your account is activated.
        </p>
        <Button onClick={() => router.push("/login")} className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30">
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 shadow-sm border border-brand-100 mb-6">
          <GraduationCap className="w-8 h-8 text-brand-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Request Access</h1>
        <p className="text-slate-500 text-sm mt-2">Submit your details for Admin verification</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-600 text-sm font-medium">{error}</div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700 text-sm font-semibold">Full Name</Label>
          <Input id="name" required placeholder="John Doe" value={formData.name} onChange={handleChange} className="bg-slate-50 border-slate-200 h-12" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 text-sm font-semibold">Official Email</Label>
          <Input id="email" type="email" required placeholder="name@gnana.edu.in" value={formData.email} onChange={handleChange} className="bg-slate-50 border-slate-200 h-12" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile" className="text-slate-700 text-sm font-semibold">Mobile Number</Label>
          <Input id="mobile" required placeholder="10-digit number" value={formData.mobile} onChange={handleChange} className="bg-slate-50 border-slate-200 h-12" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-slate-700 text-sm font-semibold">Requested Role</Label>
          <select id="role" required value={formData.role} onChange={handleChange} className="flex h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <option value="STUDENT">Student</option>
            <option value="MANDAL_ADMIN">Mandal Admin</option>
            <option value="DISTRICT_ADMIN">District Admin</option>
            <option value="STATE_ADMIN">State Admin</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700 text-sm font-semibold">Set Password</Label>
          <Input id="password" type="password" required placeholder="Min 8 characters" value={formData.password} onChange={handleChange} className="bg-slate-50 border-slate-200 h-12" />
        </div>

        <Button type="submit" disabled={loading} className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-white font-bold tracking-wide rounded-xl shadow-lg mt-4">
          {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting...</> : "Submit Registration Request"}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link href="/login" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
          Already have an account? Log in here
        </Link>
      </div>
    </div>
  );
}
