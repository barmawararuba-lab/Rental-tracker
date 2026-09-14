"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UnitInput = { unitName: string; rentAmount: string };

export default function AddPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "APARTMENT",
    address: "",
    rentAmount: "",
  });

  const [units, setUnits] = useState<UnitInput[]>([
    { unitName: "Flat 101", rentAmount: "" },
    { unitName: "Flat 102", rentAmount: "" },
  ]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddUnitRow = () => {
    const nextNum = units.length + 101;
    setUnits([...units, { unitName: `Flat ${nextNum}`, rentAmount: form.rentAmount || "" }]);
  };

  const handleRemoveUnitRow = (index: number) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const handleUnitChange = (index: number, field: keyof UnitInput, value: string) => {
    const updated = [...units];
    updated[index][field] = value;
    setUnits(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedImageUrl: string | null = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedImageUrl = uploadData.url;
        }
      }

      const payload = {
        ...form,
        imageUrl: uploadedImageUrl,
        units: form.type === "APARTMENT_BUILDING" ? units : [],
      };

      await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      router.refresh();
      router.push("/properties");
    } catch (error) {
      console.error("Error creating property:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-lg space-y-6 p-6 md:p-10">
      <div>
        <Link href="/properties" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-3">
          &larr; Back to Properties
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Add Property</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Register a new property unit or multi-unit building</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm md:p-8">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">Property Name</label>
          <input
            required
            placeholder="e.g. Sunrise Apartments / Building"
            className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">Property Type</label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="APARTMENT_BUILDING">Apartment Building (Multi-unit)</option>
            <option value="APARTMENT">Single Apartment</option>
            <option value="HOUSE">House</option>
            <option value="WEDDING_HALL">Wedding Hall</option>
            <option value="SHOP">Shop</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">Address / Location</label>
          <input
            required
            placeholder="e.g. 124 Main Street, Sector 4"
            className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
            {form.type === "APARTMENT_BUILDING" ? "Default Rent per Unit (₹)" : "Standard Rent / Rate (₹)"}
          </label>
          <input
            required
            type="number"
            min="0"
            placeholder="25000"
            className="w-full border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={form.rentAmount}
            onChange={(e) => {
              const val = e.target.value;
              setForm({ ...form, rentAmount: val });
              if (form.type === "APARTMENT_BUILDING") {
                setUnits(units.map((u) => ({ ...u, rentAmount: u.rentAmount || val })));
              }
            }}
          />
        </div>

        {/* Multi-Unit Section for Apartment Buildings */}
        {form.type === "APARTMENT_BUILDING" && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Building Units (Flats)</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Define individual units inside this building</p>
              </div>
              <button
                type="button"
                onClick={handleAddUnitRow}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md transition-colors"
              >
                + Add Unit
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {units.map((unit, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700/70">
                  <input
                    required
                    placeholder="Unit name (e.g. Flat 101)"
                    className="flex-1 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-md p-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={unit.unitName}
                    onChange={(e) => handleUnitChange(idx, "unitName", e.target.value)}
                  />
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="Rent (₹)"
                    className="w-28 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-md p-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={unit.rentAmount}
                    onChange={(e) => handleUnitChange(idx, "rentAmount", e.target.value)}
                  />
                  {units.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUnitRow(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1 text-xs font-bold"
                      title="Remove Unit"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Property Image Upload */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
            Property Image <span className="text-slate-400 dark:text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:bg-slate-800 file:text-slate-700 dark:text-slate-300 hover:file:bg-slate-200 cursor-pointer"
          />

          {imagePreview && (
            <div className="mt-3 relative w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 dark:border-slate-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Property Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 bg-slate-900 dark:bg-slate-700/80 text-white text-xs px-2 py-1 rounded hover:bg-slate-900 dark:hover:bg-slate-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
        >
          {loading ? "Saving Property..." : "Save Property"}
        </button>
      </form>
    </main>
  );
}
