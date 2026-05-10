"use client";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCreateLostItem } from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";

interface FormData {
  title:         string;
  description:   string;
  category:      string;
  color:         string;
  brand:         string;
  location_lost: string;
  date_lost:     string;
  image:         File | null;
}

const INITIAL: FormData = {
  title: "", description: "", category: "",
  color: "", brand: "", location_lost: "", date_lost: "", image: null,
};

const STEPS = ["Details", "Location & Date", "Media"];

const CATEGORIES = [
  { value: "Electronics",  label: "Electronics" },
  { value: "Accessories",  label: "Accessories" },
  { value: "Documents",    label: "Documents" },
  { value: "Clothing",     label: "Clothing" },
  { value: "Bags",         label: "Bags & Luggage" },
  { value: "Keys",         label: "Keys" },
  { value: "Other",        label: "Other" },
];

const COLORS = ["Black","White","Red","Blue","Green","Yellow","Brown","Grey","Silver","Gold","Pink","Purple","Orange","Navy","Beige"];

export default function ReportLostPage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { error: showError } = useToast();

  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState<FormData>(INITIAL);
  const [errors, setErrors]   = useState<Partial<Record<keyof FormData, string>>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag]       = useState(false);
  const [success, setSuccess] = useState(false);

  const createMut = useCreateLostItem();

  const set = (field: keyof FormData, value: string | File | null) =>
    setForm(f => ({ ...f, [field]: value }));

  const clearErr = (field: keyof FormData) =>
    setErrors(e => ({ ...e, [field]: undefined }));

  const validate = (s: number): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (s === 0) {
      if (!form.title.trim()) e.title    = "Item name is required";
      if (!form.category)     e.category = "Category is required";
    }
    if (s === 1) {
      if (!form.location_lost.trim()) e.location_lost = "Location is required";
      if (!form.date_lost)            e.date_lost     = "Date is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else handleSubmit();
  };

  const applyFile = (file: File) => {
    if (!["image/jpeg","image/jpg","image/png","image/webp"].includes(file.type)) {
      setErrors(e => ({ ...e, image: "Only JPG, PNG, WebP allowed" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(e => ({ ...e, image: "File must be under 5 MB" }));
      return;
    }
    set("image", file);
    setErrors(e => ({ ...e, image: undefined }));
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  }, []); // eslint-disable-line

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append("title",         form.title.trim());
    fd.append("category",      form.category);
    fd.append("location_lost", form.location_lost.trim());
    fd.append("date_lost",     form.date_lost);
    // Merge color + brand into description for richer matching
    const desc = [
      form.description.trim(),
      form.color   ? `Color: ${form.color}`   : "",
      form.brand   ? `Brand: ${form.brand}`   : "",
    ].filter(Boolean).join(". ");
    fd.append("description", desc);
    if (form.image) fd.append("image", form.image);

    try {
      await createMut.mutateAsync(fd);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/inventory"), 2000);
    } catch (err: any) {
      showError("Submission failed", err.response?.data?.error || "Please try again.");
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-panel rounded-3xl p-12 flex flex-col items-center gap-5 max-w-sm text-center">
        <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <span className="material-symbols-outlined icon-fill text-5xl text-primary">check_circle</span>
        </div>
        <h2 className="text-2xl font-extrabold text-primary">Report Submitted!</h2>
        <p className="text-[#bbc9cf] text-sm">Your lost item has been added to the network. AI matching is now active.</p>
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-[#859399]">Redirecting to inventory…</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative">

      {/* Header */}
      <div className="text-center mb-10 relative z-10 w-full max-w-3xl">
        <h1 className="text-[42px] font-extrabold text-primary tracking-tighter mb-3">Report Lost Item</h1>
        <p className="text-[#bbc9cf] text-base max-w-xl mx-auto">
          Our AI will search across the network and auto-match your item with found reports.
        </p>
      </div>

      {/* Card */}
      <div className="glass-panel rounded-3xl w-full max-w-3xl relative z-10 p-8 md:p-12 neon-glow-primary">
        {/* Step indicators */}
        <div className="flex justify-between items-center mb-10 relative">
          <div className="absolute left-0 top-1/2 w-full h-[1px] bg-white/8 -z-10 -translate-y-1/2" />
          <div
            className="absolute left-0 top-1/2 h-[2px] bg-primary -z-10 -translate-y-1/2 transition-all duration-500"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                i <= step
                  ? "bg-primary text-[#121414] shadow-[0_0_15px_rgba(165,231,255,0.4)]"
                  : "bg-[#282a2b] border border-white/10 text-[#bbc9cf]"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] font-bold tracking-widest uppercase ${i <= step ? "text-primary" : "text-[#bbc9cf]"}`}>{s}</span>
            </div>
          ))}
        </div>

        {/* ── STEP 0: Details ── */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#e2e2e2] mb-5 border-b border-white/5 pb-4">Item Characteristics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#bbc9cf] text-xs font-bold uppercase tracking-wider">
                  Item Name <span className="text-red-400">*</span>
                </label>
                <input
                  className={`form-input px-4 py-3 ${errors.title ? "border-red-500/60" : ""}`}
                  placeholder="e.g. Leather Wallet"
                  value={form.title}
                  onChange={e => { set("title", e.target.value); clearErr("title"); }}
                />
                {errors.title && <p className="text-red-400 text-xs">{errors.title}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#bbc9cf] text-xs font-bold uppercase tracking-wider">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  className={`form-input px-4 py-3 appearance-none ${errors.category ? "border-red-500/60" : ""}`}
                  value={form.category}
                  onChange={e => { set("category", e.target.value); clearErr("category"); }}
                >
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {errors.category && <p className="text-red-400 text-xs">{errors.category}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#bbc9cf] text-xs font-bold uppercase tracking-wider">Color</label>
                <select
                  className="form-input px-4 py-3 appearance-none"
                  value={form.color}
                  onChange={e => set("color", e.target.value)}
                >
                  <option value="">Select color…</option>
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#bbc9cf] text-xs font-bold uppercase tracking-wider">Brand / Make</label>
                <input
                  className="form-input px-4 py-3"
                  placeholder="e.g. Apple, Samsung, Nike…"
                  value={form.brand}
                  onChange={e => set("brand", e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#bbc9cf] text-xs font-bold uppercase tracking-wider">Description / Distinguishing Features</label>
              <textarea
                className="form-input px-4 py-3 h-28 resize-none"
                placeholder="Serial numbers, unique marks, contents — the more detail, the better the AI match…"
                value={form.description}
                onChange={e => set("description", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── STEP 1: Location & Date ── */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#e2e2e2] mb-5 border-b border-white/5 pb-4">Location & Date</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[#bbc9cf] text-xs font-bold uppercase tracking-wider">
                  Where did you lose it? <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#859399]">location_on</span>
                  <input
                    className={`form-input pl-11 py-3 ${errors.location_lost ? "border-red-500/60" : ""}`}
                    placeholder="e.g. Library Block B, 2nd floor"
                    value={form.location_lost}
                    onChange={e => { set("location_lost", e.target.value); clearErr("location_lost"); }}
                  />
                </div>
                {errors.location_lost && <p className="text-red-400 text-xs">{errors.location_lost}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#bbc9cf] text-xs font-bold uppercase tracking-wider">
                  Date Lost <span className="text-red-400">*</span>
                </label>
                <input
                  className={`form-input px-4 py-3 ${errors.date_lost ? "border-red-500/60" : ""}`}
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={form.date_lost}
                  onChange={e => { set("date_lost", e.target.value); clearErr("date_lost"); }}
                />
                {errors.date_lost && <p className="text-red-400 text-xs">{errors.date_lost}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Media ── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#e2e2e2] mb-5 border-b border-white/5 pb-4">
              Upload Photo <span className="text-[#859399] text-sm font-normal">(optional — improves matching)</span>
            </h2>

            {preview ? (
              <div className="relative rounded-2xl overflow-hidden border border-primary/30" style={{ maxHeight: 260 }}>
                <img src={preview} alt="preview" className="w-full object-cover" style={{ maxHeight: 260 }} />
                <button
                  onClick={() => { setPreview(null); set("image", null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 border border-white/20 flex items-center justify-center hover:bg-red-900/60 transition-colors"
                >
                  <span className="material-symbols-outlined text-white text-base">close</span>
                </button>
                <div className="absolute bottom-3 left-3 bg-black/70 rounded-full px-3 py-1 text-xs text-primary font-semibold border border-primary/20">
                  {form.image?.name} · {((form.image?.size || 0) / 1024).toFixed(0)} KB
                </div>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center h-52 rounded-2xl cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${drag ? "rgba(165,231,255,0.6)" : "rgba(165,231,255,0.25)"}`,
                  background: drag ? "rgba(165,231,255,0.05)" : "rgba(0,0,0,0.2)",
                }}
              >
                <span className="material-symbols-outlined text-5xl text-primary/40 mb-3">cloud_upload</span>
                <p className="text-[#bbc9cf] text-sm">Drag & drop or <span className="text-primary underline">browse</span></p>
                <p className="text-[#859399] text-xs mt-1">PNG, JPG, WebP — max 5 MB</p>
              </div>
            )}

            {(errors as any).image && <p className="text-red-400 text-xs">{(errors as any).image}</p>}
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) applyFile(f); }} />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-4 pt-8 border-t border-white/8 mt-10">
          <button
            className="px-6 py-3 font-semibold text-[#e2e2e2] bg-[#1e2020] hover:bg-[#282a2b] rounded-2xl transition-colors border border-white/5 disabled:opacity-40"
            type="button"
            onClick={() => step === 0 ? router.back() : setStep(s => s - 1)}
            disabled={createMut.isPending}
          >
            {step === 0 ? "Cancel" : "Back"}
          </button>
          <button
            className="btn-primary px-8 py-3 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            onClick={next}
            disabled={createMut.isPending}
          >
            {createMut.isPending ? (
              <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Submitting…</>
            ) : step === STEPS.length - 1 ? (
              <>Submit Report <span className="material-symbols-outlined">check</span></>
            ) : (
              <>Continue <span className="material-symbols-outlined">arrow_forward</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
