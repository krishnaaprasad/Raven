"use client";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { Trash2, Truck, Gift, Sparkles, Info } from "lucide-react";

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

  const renderIcon = (icon) => {
    switch (icon) {
      case "Truck":
        return <Truck size={14} />;
      case "Gift":
        return <Gift size={14} />;
      case "Info":
        return <Info size={14} />;
      default:
        return <Sparkles size={14} />;
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/admin/marquee");
      const data = await res.json();

      const formatted =
        data.lines?.map((item) =>
          typeof item === "string"
            ? { text: item, icon: "Sparkles", link: "" }
            : item
        ) || [];

      setLines(formatted);
      setActive(data.active);
      setLoading(false);
    }
    load();
  }, []);

  async function saveChanges() {
    setSaving(true);

    await fetch("/api/admin/marquee", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active, lines }),
    });

    setSaving(false);
  }

  async function revertChanges() {
    const res = await fetch("/api/admin/marquee");
    const data = await res.json();

    const formatted =
      data.lines?.map((item) =>
        typeof item === "string"
          ? { text: item, icon: "Sparkles", link: "" }
          : item
      ) || [];

    setLines(formatted);
    setActive(data.active);
  }

  function addLine() {
    setLines([...lines, { text: "", icon: "Sparkles", link: "" }]);
  }

  function removeLine(index) {
    const updated = [...lines];
    updated.splice(index, 1);
    setLines(updated);
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[#e7e1cf] p-5 bg-[#fcfbf8]">
        Loading…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e7e1cf] p-5 bg-[#fcfbf8] space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold font-serif text-[#1b180d]">
          Marquee Manager
        </h3>

        {/* Toggle */}
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={() => setActive(!active)}
            className="sr-only"
          />
          <span
            className={`w-12 h-6 rounded-full inline-block transition-colors ${
              active ? "bg-[#b28c34]" : "bg-gray-400"
            } relative`}
          >
            <span
              className="absolute top-[3px] w-5 h-5 bg-white rounded-full transition-all"
              style={{ left: active ? "26px" : "3px" }}
            />
          </span>
        </label>
      </div>

      {/* Line Fields */}
      <div className="space-y-3">
        {lines.map((line, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-2 items-center bg-white border border-[#e7e1cf] rounded-md px-2 py-2"
          >
            <input
              value={line.text}
              onChange={(e) => {
                const updated = [...lines];
                updated[index].text = e.target.value;
                setLines(updated);
              }}
              className="col-span-7 rounded-md border border-[#e7e1cf] px-2 py-1 text-sm"
              placeholder="Message"
            />

            <select
              value={line.icon}
              onChange={(e) => {
                const updated = [...lines];
                updated[index].icon = e.target.value;
                setLines(updated);
              }}
              className="col-span-3 rounded-md border border-[#e7e1cf] px-1 py-1 text-sm"
            >
              {iconOptions.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => removeLine(index)}
              className="col-span-1 flex justify-center items-center bg-red-100 text-red-600 rounded-md hover:bg-red-200"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button
          onClick={addLine}
          className="px-3 py-1 rounded-md bg-[#e7e1cf] text-sm border border-[#d4cbb5] hover:bg-[#dfd9c8]"
        >
          + Add Offer Line
        </button>
      </div>

      {/* Preview */}
      <div>
        <div className="text-sm text-[#888] mb-2">Live Preview</div>
        <Marquee pauseOnHover gradient={false} speed={60} className="px-2">
          {lines.map((l, i) => (
            <span key={i} className="mx-6 flex items-center gap-2 font-medium text-sm">
              {renderIcon(l.icon)} {l.text}
            </span>
          ))}
        </Marquee>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={saveChanges}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-[#b28c34] text-white font-semibold hover:bg-[#9a864c]"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>

        <button
          onClick={revertChanges}
          className="px-4 py-2 rounded-md bg-white border border-[#e7e1cf]"
        >
          Revert
        </button>
      </div>
    </div>
  );
}
