"use client";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import {
  Trash2,
  Truck,
  Gift,
  Sparkles,
  Info,
  ChevronDown,
  Megaphone,
  Save,
  RotateCcw,
  Plus,
} from "lucide-react";

export default function MarqueeManager() {
  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState([]);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const iconOptions = [
    { label: "Sparkles", value: "Sparkles" },
    { label: "Truck", value: "Truck" },
    { label: "Gift", value: "Gift" },
    { label: "Info", value: "Info" },
  ];

  const renderIcon = (icon, size = 14) => {
    switch (icon) {
      case "Truck": return <Truck size={size} />;
      case "Gift": return <Gift size={size} />;
      case "Info": return <Info size={size} />;
      default: return <Sparkles size={size} />;
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/marquee");
        const data = await res.json();

        const formatted =
          data.lines?.map((item) =>
            typeof item === "string"
              ? { text: item, icon: "Sparkles", link: "", open: false }
              : { ...item, open: false }
          ) || [];

        setLines(formatted);
        setActive(data.active);
      } catch (err) {
        console.error("Marquee load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveChanges() {
    setSaving(true);
    await fetch("/api/admin/marquee", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        active,
        lines: lines.map(({ open, ...rest }) => rest),
      }),
    });
    setSaving(false);
  }

  async function revertChanges() {
    const res = await fetch("/api/admin/marquee");
    const data = await res.json();

    const formatted =
      data.lines?.map((item) =>
        typeof item === "string"
          ? { text: item, icon: "Sparkles", link: "", open: false }
          : { ...item, open: false }
      ) || [];

    setLines(formatted);
    setActive(data.active);
  }

  function addLine() {
    setLines([...lines, { text: "", icon: "Sparkles", link: "", open: false }]);
  }

  function removeLine(index) {
    setLines(lines.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white animate-pulse">
        <div className="h-4 w-36 bg-[#f0ece3] rounded mb-4" />
        <div className="h-20 bg-[#f8f5ee] rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e7e1cf] p-5 bg-white space-y-4 relative overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-[#b28c34]" />
          <h3 className="text-sm font-bold text-[#1b180d]">Announcement Bar</h3>
        </div>

        {/* Toggle */}
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={() => setActive(!active)}
            className="sr-only"
          />
          <span
            className={`w-10 h-5 rounded-full inline-block transition-colors ${
              active ? "bg-[#b28c34]" : "bg-gray-300"
            } relative`}
          >
            <span
              className="absolute top-[2px] w-4 h-4 bg-white rounded-full shadow transition-all"
              style={{ left: active ? "22px" : "2px" }}
            />
          </span>
        </label>
      </div>

      {/* Line Fields */}
      <div className="space-y-2">
        {lines.map((line, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-[#fcfbf8] border border-[#e7e1cf] rounded-lg px-2.5 py-2 relative overflow-visible"
          >
            {/* Message */}
            <input
              value={line.text}
              onChange={(e) => {
                const updated = [...lines];
                updated[index].text = e.target.value;
                setLines(updated);
              }}
              className="flex-1 rounded-md border border-[#e7e1cf] px-2.5 py-1.5 text-xs bg-white text-[#1b180d]"
              placeholder="Announcement text..."
            />

            {/* Icon Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const updated = [...lines];
                  updated.forEach((l, i) => (l.open = i === index ? !l.open : false));
                  setLines(updated);
                }}
                className="w-8 h-8 border border-[#e7e1cf] rounded-md bg-white flex items-center justify-center hover:bg-[#f5f1e6]"
              >
                {renderIcon(line.icon, 14)}
              </button>

              {line.open && (
                <div className="absolute top-10 right-0 w-28 bg-white border border-[#e7e1cf] rounded-lg shadow-lg z-50">
                  {iconOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        const updated = [...lines];
                        updated[index].icon = opt.value;
                        updated[index].open = false;
                        setLines(updated);
                      }}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs hover:bg-[#f5f1e6] first:rounded-t-lg last:rounded-b-lg"
                    >
                      {renderIcon(opt.value, 12)}
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delete */}
            <button
              onClick={() => removeLine(index)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button
          onClick={addLine}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-dashed border-[#d4cbb5] rounded-lg hover:bg-[#f5f1e6] text-[#6b6654]"
        >
          <Plus size={12} />
          Add Line
        </button>
      </div>

      {/* Preview */}
      {lines.some((l) => l.text) && (
        <div>
          <p className="text-[10px] text-[#9a864c] uppercase tracking-wider mb-1.5">Preview</p>
          <div className="rounded-lg bg-[#1b180d] py-1.5 px-2 overflow-hidden">
            <Marquee pauseOnHover gradient={false} speed={50}>
              {lines
                .filter((l) => l.text)
                .map((l, i) => (
                  <span
                    key={i}
                    className="mx-8 flex items-center gap-2 text-white text-xs font-medium"
                  >
                    {renderIcon(l.icon, 12)} {l.text}
                  </span>
                ))}
            </Marquee>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={saveChanges}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#b28c34] text-white hover:bg-[#9a864c] disabled:opacity-60"
        >
          <Save size={12} />
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={revertChanges}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#e7e1cf] hover:bg-[#f5f1e6] text-[#6b6654]"
        >
          <RotateCcw size={12} />
          Revert
        </button>
      </div>
    </div>
  );
}
