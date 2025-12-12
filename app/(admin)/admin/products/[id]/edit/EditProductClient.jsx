// app/(admin)/admin/products/[id]/edit/EditProductClient.jsx
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UploadCloud,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { TouchSensor } from "@dnd-kit/core";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Tiptap imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// ---------- Helpers ----------
function slugify(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitCsv(str) {
  if (!str) return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Sortable thumbnail card
function SortableImageCard({ image, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group rounded-lg overflow-hidden border border-[#e7e1cf] bg-white"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        style={{ touchAction: "none" }}
        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white/90 text-[#6b6654] flex items-center justify-center shadow-sm cursor-grab hover:bg-white"
      >
        <GripVertical className="w-3 h-3" />
      </button>

      <img
        src={image.thumbnail || image.original}
        alt="Product"
        className="w-full h-24 object-cover"
      />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center transition 
           opacity-100 md:opacity-0 md:group-hover:opacity-100"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function EditProductClient({ productId }) {
  const router = useRouter();

  // avoid SSR hydration issues
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Refs for validation focus/scroll
  const nameRef = useRef(null);
  const slugRef = useRef(null);
  const brandRef = useRef(null);
  const imageRef = useRef(null);
  const variantRef = useRef(null);

  // Core fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [brand, setBrand] = useState("");

  // description initial content from DB
  const [initialDescription, setInitialDescription] = useState("");

  // Fragrance profile
  const [fragranceType, setFragranceType] = useState("Eau de Parfum");
  const [longevity, setLongevity] = useState("Moderate");
  const [sillage, setSillage] = useState("Moderate");

  // Notes
  const [topNotesInput, setTopNotesInput] = useState("");
  const [heartNotesInput, setHeartNotesInput] = useState("");
  const [baseNotesInput, setBaseNotesInput] = useState("");

  // Benefits & ingredients
  const [benefitInput, setBenefitInput] = useState("");
  const [benefits, setBenefits] = useState([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState([]);

  // Variants
  const [variants, setVariants] = useState([
    { size: "", price: "", mrp: "", stock: "" },
  ]);

  // Images (with id for drag & drop)
  const [images, setImages] = useState([]); // {id, original, thumbnail}
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } })
  );

  // Tiptap editor (we don't store description in state while typing)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: true }),
      ImageExt.configure({ inline: false }),
    ],
    content: initialDescription || "",
    immediatelyRender: false,
  });

  // when initialDescription changes (after fetch), set editor content
  useEffect(() => {
    if (editor && initialDescription) {
      editor.commands.setContent(initialDescription);
    }
  }, [editor, initialDescription]);

  // ---------- Load existing product ----------
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${productId}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load product");
        }

        const p = json.data;

        setName(p.name || "");
        setSlug(p.slug || "");
        setBrand(p.brand || "");
        setInitialDescription(p.description || "");

        const mappedImages = (p.images || []).map((img, idx) => ({
          id: img._id || img.public_id || img.original || `img-${idx}`,
          original: img.original,
          thumbnail: img.thumbnail || img.original,
        }));
        setImages(mappedImages);

        setBenefits(p.benefits || []);
        setIngredients(p.ingredients || []);

        setVariants(
          (p.variants || []).length
            ? p.variants.map((v) => ({
                size: v.size || "",
                price: v.price ?? "",
                mrp: v.mrp ?? "",
                stock: v.stock ?? "",
              }))
            : [{ size: "", price: "", mrp: "", stock: "" }]
        );

        setFragranceType(p.fragranceType || "Eau de Parfum");
        setLongevity(p.longevity || "Moderate");
        setSillage(p.sillage || "Moderate");

        setTopNotesInput((p.topNotes || []).join(", "));
        setHeartNotesInput((p.heartNotes || []).join(", "));
        setBaseNotesInput((p.baseNotes || []).join(", "));

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Error loading product");
        router.push("/admin/products");
      }
    };

    fetchProduct();
  }, [productId, router]);

  // Auto-generate slug if user hasn't manually changed it
  useEffect(() => {
    if (!slugTouched && name) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  // ---------- Variant handlers ----------
  const updateVariant = (idx, key, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  };

  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      { size: "", price: "", mrp: "", stock: "" },
    ]);
  };

  const removeVariantRow = (idx) => {
    if (variants.length === 1) {
      toast.error("At least one variant is required.");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---------- Benefits / Ingredients ----------
  const addBenefit = () => {
    if (!benefitInput.trim()) return;
    setBenefits((prev) => [...prev, benefitInput.trim()]);
    setBenefitInput("");
  };

  const removeBenefit = (index) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    if (!ingredientInput.trim()) return;
    setIngredients((prev) => [...prev, ingredientInput.trim()]);
    setIngredientInput("");
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- Cloudinary upload ----------
  const uploadFiles = useCallback(async (files) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      console.error("Cloudinary env missing:", {
        CLOUD_NAME,
        UPLOAD_PRESET,
      });
      toast.error("Cloudinary env vars are missing.");
      return;
    }

    setUploading(true);
    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", UPLOAD_PRESET);

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await res.json();

          if (!res.ok) {
            console.error("Cloudinary upload error:", data);
            throw new Error(
              data.error?.message || "Upload failed. Check Cloudinary preset."
            );
          }

          return {
            id: data.public_id || data.asset_id || data.secure_url,
            original: data.secure_url,
            thumbnail: data.secure_url,
          };
        })
      );

      setImages((prev) => [...prev, ...uploads]);
      toast.success("Images uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Image upload failed");
    } finally {
      setUploading(false);
      setDragActive(false);
    }
  }, []);

  const handleImageInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    uploadFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) {
      uploadFiles(files);
    }
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((prev) => {
      const oldIndex = prev.findIndex((img) => img.id === active.id);
      const newIndex = prev.findIndex((img) => img.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // ---------- Submit ----------
  const handleSubmit = async () => {
    const finalSlug = slugify(slug || name);

    if (!name.trim()) {
      toast.error("Product name is required");
      nameRef.current?.focus();
      return;
    }
    if (!finalSlug) {
      toast.error("Slug is required");
      slugRef.current?.focus();
      return;
    }
    if (!brand.trim()) {
      toast.error("Brand is required");
      brandRef.current?.focus();
      return;
    }
    if (!editor || editor.isEmpty) {
      toast.error("Description is required");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!images.length) {
      toast.error("Please upload at least one product image");
      imageRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!variants.some((v) => v.size && v.price)) {
      toast.error("Add at least one valid variant");
      variantRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    // Ingredients optional

    const descriptionHtml = editor.getHTML();

    const payload = {
      name: name.trim(),
      slug: finalSlug,
      brand: brand.trim(),
      description: descriptionHtml,
      images: images.map((img) => ({
        original: img.original,
        thumbnail: img.thumbnail || img.original,
      })),
      benefits,
      variants: variants
        .filter((v) => v.size && v.price)
        .map((v) => ({
          size: v.size.trim(),
          price: Number(v.price),
          mrp: v.mrp ? Number(v.mrp) : undefined,
          stock: Number(v.stock) || 0,
        })),
      fragranceType,
      longevity,
      sillage,
      topNotes: splitCsv(topNotesInput),
      heartNotes: splitCsv(heartNotesInput),
      baseNotes: splitCsv(baseNotesInput),
      ingredients,
    };

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to update product");
      }

      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error updating product");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  if (!mounted || loading || !editor) {
    return <p className="p-6 text-sm">Loading product details…</p>;
  }

  // ---------- Render ----------
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 border-b border-[#e7e1cf] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/admin/products")}
            className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-[#f0ebdd]"
          >
            <ArrowLeft className="w-4 h-4 text-[#1b180d]" />
          </button>
          <h1 className="text-xl font-bold text-[#1b180d]">
            Edit Product
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Product Information */}
          <section className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1b180d]">
              Product Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                  Product Name
                </label>
                <input
                  ref={nameRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                  placeholder="e.g., Éclat de Rose"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                  Slug
                </label>
                <input
                  ref={slugRef}
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  onBlur={() => setSlug(slugify(slug || name))}
                  className="w-full h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                  placeholder="e.g., eclat-de-rose"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                  Brand
                </label>
                <input
                  ref={brandRef}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                  placeholder="e.g., Maison de Parfum"
                />
              </div>
            </div>

            {/* Description (Tiptap) */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                Description
              </label>

              <div className="rounded-lg border border-[#e7e1cf] overflow-hidden bg-white">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2 border-b border-[#e7e1cf] p-2 bg-white text-[#1b180d]">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="p-1 px-2 hover:bg-gray-200 rounded font-bold text-sm"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="p-1 px-2 hover:bg-gray-200 rounded italic text-sm"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className="p-1 px-2 hover:bg-gray-200 rounded underline text-sm"
                  >
                    U
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className="p-1 px-2 hover:bg-gray-200 rounded text-sm"
                  >
                    •
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className="p-1 px-2 hover:bg-gray-200 rounded text-sm"
                  >
                    1.
                  </button>

                  {/* Upload Image Button */}
                  <button
                    type="button"
                    className="ml-auto px-3 py-1 bg-[#b28c34] rounded text-white text-sm hover:bg-[#9a864c]"
                    onClick={async () => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.click();

                      input.onchange = async () => {
                        const file = input.files?.[0];
                        if (!file) return;

                        const form = new FormData();
                        form.append("file", file);
                        form.append(
                          "upload_preset",
                          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                        );

                        try {
                          const res = await fetch(
                            `https://api.cloudinary.com/v1_1/${
                              process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                            }/image/upload`,
                            { method: "POST", body: form }
                          );
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error?.message);
                          editor
                            .chain()
                            .focus()
                            .setImage({ src: data.secure_url })
                            .run();
                        } catch (err) {
                          console.error(err);
                          toast.error(
                            err.message || "Failed to upload image to editor"
                          );
                        }
                      };
                    }}
                  >
                    Upload Image
                  </button>
                </div>

                <div className="min-h-[180px] max-h-[420px] overflow-y-auto">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </section>

          {/* Product Images */}
          <section
            ref={imageRef}
            className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-bold mb-4 text-[#1b180d]">
              Product Images
            </h2>

            <div
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
              }}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-[#b28c34] bg-[#fff8e1]"
                  : "border-[#e7e1cf] bg-white hover:border-[#b28c34]"
              }`}
              onClick={() =>
                document.getElementById("image-upload-edit-input")?.click()
              }
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#fff3cd] text-[#b28c34] mb-2">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="font-semibold text-[#1b180d]">
                Click to upload more images
              </p>
              <p className="text-xs text-[#6b6654] mt-1">
                or drag and drop JPG / PNG (recommended 800×800px)
              </p>
              <input
                id="image-upload-edit-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageInputChange}
              />
            </div>

            {images.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={images.map((img) => img.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {images.map((img) => (
                      <SortableImageCard
                        key={img.id}
                        image={img}
                        onRemove={() => removeImage(img.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {uploading && (
              <p className="mt-2 text-xs text-[#9a864c]">
                Uploading images…
              </p>
            )}
          </section>

          {/* Variants */}
          <section
            ref={variantRef}
            className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-bold mb-4 text-[#1b180d]">Variants</h2>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start gap-3"
                >
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                      Size (ml)
                    </label>
                    <input
                      value={v.size}
                      onChange={(e) =>
                        updateVariant(idx, "size", e.target.value)
                      }
                      className="w-full h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                      placeholder="e.g., 50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(idx, "price", e.target.value)
                      }
                      className="w-full h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                      placeholder="e.g., 4999"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                      MRP (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={v.mrp}
                      onChange={(e) =>
                        updateVariant(idx, "mrp", e.target.value)
                      }
                      className="w-full h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                      placeholder="e.g., 5999"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(idx, "stock", e.target.value)
                      }
                      className="w-full h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                      placeholder="e.g., 120"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariantRow(idx)}
                    className="h-11 w-11 flex items-center justify-center rounded-lg bg-transparent text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addVariantRow}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#b28c34] hover:opacity-80"
            >
              <Plus className="w-4 h-4" />
              Add another variant
            </button>
          </section>

          {/* Details & Notes */}
          <section className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1b180d]">
              Details &amp; Notes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                  Top Notes
                </label>
                <input
                  value={topNotesInput}
                  onChange={(e) => setTopNotesInput(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                  placeholder="e.g., Bergamot, Pink Pepper"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                  Heart Notes
                </label>
                <input
                  value={heartNotesInput}
                  onChange={(e) => setHeartNotesInput(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                  placeholder="e.g., Rose, Jasmine"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                  Base Notes
                </label>
                <input
                  value={baseNotesInput}
                  onChange={(e) => setBaseNotesInput(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                  placeholder="e.g., Patchouli, Musk"
                />
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Fragrance Profile */}
          <section className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1b180d]">
              Fragrance Profile
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                  Fragrance Type
                </label>
                <select
                  value={fragranceType}
                  onChange={(e) => setFragranceType(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                >
                  <option>Eau de Parfum</option>
                  <option>Eau de Toilette</option>
                  <option>Parfum</option>
                  <option>Extrait de Parfum</option>
                  <option>Eau de Cologne</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                  Longevity
                </label>
                <select
                  value={longevity}
                  onChange={(e) => setLongevity(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                >
                  <option>Moderate</option>
                  <option>Long Lasting</option>
                  <option>Eternal</option>
                  <option>Weak</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[#6b6654]">
                  Sillage
                </label>
                <select
                  value={sillage}
                  onChange={(e) => setSillage(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                >
                  <option>Moderate</option>
                  <option>Strong</option>
                  <option>Enormous</option>
                  <option>Intimate</option>
                </select>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1b180d]">
              Benefits
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  className="flex-1 h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                  placeholder="e.g., Long-lasting scent"
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  className="h-11 px-3 rounded-lg bg-[#fff3cd] text-[#b28c34] text-sm font-semibold hover:bg-[#ffe08a]"
                >
                  Add
                </button>
              </div>

              {benefits.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {benefits.map((b, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between text-xs text-[#1b180d] bg-white border border-[#e7e1cf] rounded-md px-3 py-1"
                    >
                      <span>{b}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        className="text-red-500 hover:text-red-600 text-xs"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Ingredients (optional) */}
          <section className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1b180d]">
              Ingredients (optional)
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  className="flex-1 h-11 rounded-lg border border-[#e7e1cf] bg-white px-4 text-sm text-[#1b180d] focus:outline-none focus:ring-2 focus:ring-[#b28c34]/60"
                  placeholder="e.g., Alcohol Denat."
                />
                <button
                  type="button"
                  onClick={addIngredient}
                  className="h-11 px-3 rounded-lg bg-[#fff3cd] text-[#b28c34] text-sm font-semibold hover:bg-[#ffe08a]"
                >
                  Add
                </button>
              </div>

              {ingredients.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {ingredients.map((ing, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between text-xs text-[#1b180d] bg-white border border-[#e7e1cf] rounded-md px-3 py-1"
                    >
                      <span>{ing}</span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        className="text-red-500 hover:text-red-600 text-xs"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="min-w-[90px] h-11 px-5 rounded-lg border border-[#e7e1cf] bg-white text-sm font-semibold text-[#1b180d] hover:bg-[#f5efe2]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="min-w-[110px] h-11 px-6 rounded-lg bg-[#b28c34] text-sm font-semibold text-white hover:bg-[#9a864c] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
