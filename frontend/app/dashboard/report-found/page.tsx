"use client";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCreateFoundItem } from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";

interface FormState {
  title:          string;
  description:    string;
  category:       string;
  color:          string;
  brand:          string;
  location_found: string;
  date_found:     string;
  image:          File | null;
}

const INITIAL: FormState = {
  title: "", description: "", category: "",
  color: "", brand: "", location_found: "", date_found: "", image: null,
};

const CATEGORIES = [
  { value: "Electronics", label: "Electronics" },
  { value: "Documents",   label: "Documents / ID" },
  { value: "Accessories", label: "Accessories" },
  { value: "Bags",        label: "Bags & Luggage" },
  { value: "Keys",        label: "Keys" },
  { value: "Clothing",    label: "Clothing" },
  { value: "Other",       label: "Other" },
];

const COLORS = ["Black","White","Red","Blue","Green","Yellow","Brown","Grey","Silver","Gold","Pink","Purple","Orange","Navy","Beige"];

export default function ReportFoundPage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { error: showError } = useToast();

  const [form, setForm]         = useState<FormState>(INITIAL);
  const [errors, setErrors]     = useState<Partial<Record<keyof FormState, string>>>({});
  const [preview, setPreview]   = useState<string | null>(null);
  const [drag, setDrag]         = useState(false);
  const [success, setSuccess]   = useState(false);

  const createMut = useCreateFoundItem();

  const set = (field: keyof FormState, value: string | File | null) =>
    setForm(f => ({ ...f, [field]: value }));

  const clearErr = (field: keyof FormState) =>
    setErrors(e => ({ ...e, [field]: undefined }));

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

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim())          e.title          = "Item name is required";
    if (!form.category)              e.category       = "Category is required";
    if (!form.location_found.trim()) e.location_found = "Location is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append("title",          form.title.trim());
    fd.append("category",       form.category);
    fd.append("location_found", form.location_found.trim());
    fd.append("date_found",     form.date_found);
    const desc = [
      form.description.trim(),
      form.color ? `Color: ${form.color}` : "",
      form.brand ? `Brand: ${form.brand}` : "",
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
        <div className="w-20 h-20 rounded-full bg-[#edb1ff]/20 border border-[#edb1ff]/30 flex items-center justify-center">
          <span className="material-symbols-outlined icon-fill text-5xl text-[#edb1ff]">check_circle</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#edb1ff]">Item Submitted!</h2>
        <p className="text-[#bbc9cf] text-sm">Found item added to the network. AI matching is now scanning for potential owners.</p>
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-full bg-[#edb1ff] animate-pulse" />
          <span className="text-xs text-[#859399]">Redirecting to inventory…</span>
        </div>
      </div>
    </div>
  );

  return (
    <main className="p-8 md:p-12 min-h-screen relative z-10">
      <header className="mb-8 max-w-[1100px] mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
          <h1 className="text-[38px] font-extrabold text-[#e2e2e2] tracking-tighter">Report Found Item</h1>
        </div>
        <p className="text-[#bbc9cf] text-sm max-w-xl">
          Add a found item to the network. AI will scan and generate potential owner matches automatically.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-5 max-w-[1100px] mx-auto pb-16">

        {/* ── Image upload zone ── */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-3xl p-7 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <span className="material-symbols-outlined text-primary">cloud_upload</span>
            <h3 className="font-semibold text-[#e2e2e2] text-base">Item Photo</h3>
            <span className="text-[#859399] text-xs">(optional — improves matching accuracy)</span>
          </div>

          {preview ? (
            <div className="relative rounded-2xl overflow-hidden border border-primary/30 flex-1" style={{ minHeight: 220 }}>
              <img src={preview} alt="preview" className="w-full h-full object-cover" style={{ maxHeight: 280 }} />
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
              className="flex-1 flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all"
              style={{
                minHeight: 220,
                border: `2px dashed ${drag ? "rgba(165,231,255,0.6)" : "rgba(165,231,255,0.2)"}`,
                background: drag ? "rgba(165,231,255,0.05)" : "rgba(0,0,0,0.15)",
              }}
            >
              <span className="material-symbols-outlined text-6xl text-primary/30 mb-4">add_photo_alternate</span>
              <p className="text-[#bbc9cf] text-sm">Drag & drop or <span className="text-primary underline">browse files</span></p>
              <p className="text-[#859399] text-xs mt-1">PNG, JPG, WebP — max 5 MB</p>
            </div>
          )}

          {errors.image && <p className="text-red-400 text-xs">{errors.image}</p>}
          <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) applyFile(f); }} />

          {/* AI status bar */}
          <div className="flex gap-2">
            {[
              { icon: "auto_awesome", label: "AI Core: Scanning",    color: "text-primary" },
              { icon: "hub",          label: "Network: Online",       color: "text-[#edb1ff]" },
              { icon: "sensors",      label: "Matcher: Active",       color: "text-primary" },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 flex-1">
                <span className={`material-symbols-outlined ${b.color} text-sm`}>{b.icon}</span>
                <span className="text-[10px] font-bold text-[#859399] uppercase tracking-wider truncate">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Side panel ── */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="glass-panel rounded-3xl p-5">
            <h3 className="font-semibold text-[#e2e2e2] text-base mb-3">Submission State</h3>
            <div className="border border-white/5 bg-[#1a1c1c]/50 rounded-xl p-5 flex flex-col items-center text-center">
              {createMut.isPending ? (
                <>
                  <span className="material-symbols-outlined text-primary text-4xl animate-spin mb-3">progress_activity</span>
                  <p className="font-semibold text-primary text-sm">Uploading…</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#121414] border border-white/10 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[#859399] text-2xl">hourglass_empty</span>
                  </div>
                  <p className="font-semibold text-[#bbc9cf]/50 text-sm">Awaiting Submission</p>
                </>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5">
            <h3 className="font-semibold text-[#e2e2e2] text-base mb-4">Matching Tips</h3>
            <div className="space-y-3 text-xs text-[#859399]">
              {[
                "Add color to boost matching accuracy by 10%",
                "Include brand name for synonym detection",
                "Describe unique features or serial numbers",
                "Exact location helps date-proximity scoring",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-primary material-symbols-outlined text-sm mt-0.5">lightbulb</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="col-span-12 glass-panel rounded-3xl p-7">
          <div className="mb-5 flex items-center gap-3 border-b border-white/5 pb-4">
            <span className="material-symbols-outlined text-[#bbc9cf]">edit_note</span>
            <h3 className="font-semibold text-[#e2e2e2] text-base">Item Details</h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[#bbc9cf] text-[10px] font-bold tracking-widest uppercase">
                Item Name <span className="text-red-400">*</span>
              </label>
              <input
                className={`form-input px-4 py-3 ${errors.title ? "border-red-500/60" : ""}`}
                placeholder="e.g. Blue Leather Wallet"
                value={form.title}
                onChange={e => { set("title", e.target.value); clearErr("title"); }}
              />
              {errors.title && <p className="text-red-400 text-xs">{errors.title}</p>}
            </div>

            {/* Location */}
            <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[#bbc9cf] text-[10px] font-bold tracking-widest uppercase">
                Recovery Location <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#859399]">location_on</span>
                <input
                  className={`form-input pl-11 py-3 ${errors.location_found ? "border-red-500/60" : ""}`}
                  placeholder="e.g. Cafeteria near Gate 2"
                  value={form.location_found}
                  onChange={e => { set("location_found", e.target.value); clearErr("location_found"); }}
                />
              </div>
              {errors.location_found && <p className="text-red-400 text-xs">{errors.location_found}</p>}
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#bbc9cf] text-[10px] font-bold tracking-widest uppercase">
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

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#bbc9cf] text-[10px] font-bold tracking-widest uppercase">Date Found</label>
              <input
                className="form-input px-4 py-3"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={form.date_found}
                onChange={e => set("date_found", e.target.value)}
              />
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#bbc9cf] text-[10px] font-bold tracking-widest uppercase">Color</label>
              <select
                className="form-input px-4 py-3 appearance-none"
                value={form.color}
                onChange={e => set("color", e.target.value)}
              >
                <option value="">Select color…</option>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Brand */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#bbc9cf] text-[10px] font-bold tracking-widest uppercase">Brand / Make</label>
              <input
                className="form-input px-4 py-3"
                placeholder="e.g. Apple, Samsung…"
                value={form.brand}
                onChange={e => set("brand", e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[#bbc9cf] text-[10px] font-bold tracking-widest uppercase">Description / Message to Owner</label>
              <textarea
                className="form-input p-4 resize-none"
                placeholder="Describe the item in detail. This helps the AI find the right owner."
                rows={3}
                value={form.description}
                onChange={e => set("description", e.target.value)}
              />
            </div>

            {/* Submit */}
            <div className="col-span-1 md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={createMut.isPending}
                className="btn-primary px-8 py-3 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMut.isPending ? (
                  <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Submitting…</>
                ) : (
                  <>Submit to Network <span className="material-symbols-outlined">send</span></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
