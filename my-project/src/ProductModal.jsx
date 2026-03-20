// src/ProductModal.jsx
import React from 'react';
import { X, Plus, Loader2, ChevronDown } from 'lucide-react';
import { Button } from './StoreAdmin';

// --- NAYA CODE: Cloudinary Helper ---
const optimizeCloudinaryUrl = (url) => {
    if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return url;
    if (url.includes('/upload/f_auto,q_auto')) return url;
    const parts = url.split('/upload/');
    if (parts.length === 2) return `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
    return url;
};
// ------------------------------------

export default function ProductModal({
  isOpen,
  onClose,
  editingProduct,
  handleSaveProduct,
  isSubmitting,
  images,
  removeImage,
  uploading,
  handleImageUpload,
  categoryInput,
  setCategoryInput,
  showCategoryDropdown,
  setShowCategoryDropdown,
  getAvailableCategories,
  // Prop Changes: colors aur setColors props ko yahan se hata diya gaya hai
}) {
  // Function Changes: handleAddColor, handleRemoveColor, aur handleColorChange functions ko hata diya gaya hai

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      <div
        className={`fixed z-[70] bg-slate-900 flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-white/10
                bottom-0 left-0 right-0 h-[90vh] rounded-t-[2rem] border-t border-x
                md:top-0 md:bottom-0 md:right-0 md:left-auto md:h-full md:w-[450px] md:rounded-none md:rounded-l-[2rem] md:border-l md:border-t-0 md:border-r-0
                ${
                  isOpen
                    ? 'translate-y-0 md:translate-x-0'
                    : 'translate-y-full md:translate-y-0 md:translate-x-full'
                }`}
      >
        {/* Drag Handle for Mobile */}
        <div className="md:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-4 mb-2 cursor-grab active:cursor-grabbing" />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-slate-900/90 backdrop-blur md:rounded-tl-[2rem] sticky top-0 z-10">
          <h2 className="text-xl font-black text-white tracking-tight">
            {editingProduct ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors group"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar pb-32">
          <form
            id="productForm"
            onSubmit={handleSaveProduct}
            className="space-y-6"
          >
            {/* Image Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                Images (Max 4)
              </label>
              <div className="grid grid-cols-4 gap-3">
                {images.map((imgObj, idx) => (
                  <div
                    key={idx}
                    className="aspect-square relative rounded-xl overflow-hidden border border-slate-700 group shadow-lg"
                  >
                    {/* --- CHANGE HERE: optimizeCloudinaryUrl ka use preview images par bhi laga diya hai --- */}
                    <img
                      src={optimizeCloudinaryUrl(imgObj.url)}
                      alt="product"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/50 text-red-400 p-1 rounded-full shadow-md backdrop-blur hover:bg-red-500 hover:text-white transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-0 inset-x-0 bg-rose-600/90 text-white text-[9px] font-bold text-center py-1 backdrop-blur">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
                {images.length < 4 && (
                  <label
                    className={`aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 hover:border-rose-500/50 transition-all ${uploading ? 'opacity-50' : ''}`}
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-slate-500 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">
                          Add
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      multiple
                      disabled={uploading}
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest ml-1">
                Product Name
              </label>
              <input
                name="name"
                defaultValue={editingProduct?.name}
                required
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-white placeholder:text-slate-600"
                placeholder="e.g. Premium Gift Box"
              />
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 my-4">
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                <span className="text-rose-400 font-bold">Recommendation:</span>{' '}
                For a seamless customer experience, please include your
                estimated shipping cost within the base price. Offering "Free
                Delivery" directly builds trust and increases your sales.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest ml-1">
                  Price (₹)
                </label>
                <input
                  name="price"
                  defaultValue={editingProduct?.price}
                  required
                  type="number"
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-white placeholder:text-slate-600"
                  placeholder="0"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest ml-1">
                  compareAtPrice (₹)
                </label>
                <input
                  name="compareAtPrice"
                  defaultValue={editingProduct?.compareAtPrice}
                  type="number"
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-white placeholder:text-slate-600"
                  placeholder="0"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest ml-1">
                  Stock
                </label>
                <input
                  name="stock"
                  defaultValue={editingProduct?.stock}
                  required
                  type="number"
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-white placeholder:text-slate-600"
                  placeholder="0"
                />
              </div>
            </div>

            {/* CATEGORY SECTION */}
            <div className="space-y-1 relative group z-30">
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest ml-1">
                Category
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => {
                    setCategoryInput(e.target.value);
                    setShowCategoryDropdown(true);
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowCategoryDropdown(false), 200)
                  }
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-white pr-10 placeholder:text-slate-600"
                  placeholder="Select or type..."
                  required
                />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />

                {/* DROPDOWN */}
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar z-50 animate-in fade-in zoom-in-95">
                    {getAvailableCategories()
                      .filter((c) =>
                        c.toLowerCase().includes(categoryInput.toLowerCase()),
                      )
                      .map((c, idx) => (
                        <div
                          key={idx}
                          onMouseDown={() => {
                            setCategoryInput(c);
                            setShowCategoryDropdown(false);
                          }}
                          className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-sm font-bold text-slate-300 hover:text-white border-b border-white/5 last:border-0 transition-colors"
                        >
                          {c}
                        </div>
                      ))}
                    {getAvailableCategories().filter((c) =>
                      c.toLowerCase().includes(categoryInput.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500 italic">
                        Type to add new
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest ml-1">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={editingProduct?.description}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-white placeholder:text-slate-600"
                rows="3"
                placeholder="Product details..."
              />
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 md:p-6 border-t border-white/5 bg-slate-900 sticky bottom-0 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
          <Button
            type="submit"
            form="productForm"
            size="lg"
            loading={isSubmitting}
            className="w-full shadow-xl shadow-rose-900/40"
          >
            Save Product
          </Button>
        </div>
      </div>
    </>
  );
}