"use client";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";

export default function MarqueeManager() {
  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState([]);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load marquee data from backend
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await fetch("/api/admin/marquee");
      const data = await res.json();

      setLines(data.lines || []);
      setActive(data.active);
      setLoading(false);
    }

    load();
  }, []);

  // Save
  async function saveChanges() {
    setSaving(true);

    await fetch("/api/admin/marquee", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active, lines }),
    });

    setSaving(false);
  }

  // Revert
  async function revertChanges() {
    const res = await fetch("/api/admin/marquee");
    const data = await res.json();

    setLines(data.lines);
    setActive(data.active);
  }

  // Add new line
  function addLine() {
    setLines([...lines, ""]);
  }

  // Remove line
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
        <h3 className="text-lg font-semibold font-Arial text-[#1b180d]">
          Marquee Text
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
            className={`w-11 h-6 rounded-full inline-block transition-colors ${
              active ? "bg-[#b28c34]" : "bg-gray-400"
            }`}
            style={{ position: "relative" }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: active ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: "80%",
                background: "#fff",
                transition: "left 0.2s",
              }}
            />
          </span>
        </label>
      </div>

      {/* Lines list */}
      <div className="space-y-4">
        {lines.map((line, index) => (
          <div key={index} className="flex text-sm gap-3 items-center">
            <input
              value={line}
              onChange={(e) => {
                const updated = [...lines];
                updated[index] = e.target.value;
                setLines(updated);
              }}
              className="flex-1 rounded-md border border-[#e7e1cf] px-2 py-1 bg-white"
              placeholder={`Line ${index + 1}`}
            />
            <button
              onClick={() => removeLine(index)}
              className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        ))}

        {/* Add Line Button */}
        <button
          onClick={addLine}
          className="px-2 py-1 bg-[#e7e1cf] border border-[#d4cbb5] rounded-md hover:bg-[#dfd9c8]"
        >
          + Add Offer Line
        </button>
      </div>

      {/* Preview */}
      <div>
        <div className="text-sm text-[#888] mb-2">Live Preview</div>
        <Marquee pauseOnClick gradient={false} speed={60} className="px-8">
        <div className="rounded-md bg-[#fff7ea] p-2 text-sm border border-[#f0e7d6] whitespace-nowrap overflow-x-auto">
          {lines.join("      •      ")}
        </div>
        </Marquee>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={saveChanges}
          disabled={saving}
          className="px-3 py-1 rounded-md bg-[#b28c34] text-white font-semibold hover:bg-[#9a864c]"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>

        <button
          onClick={revertChanges}
          className="px-3 py-1 rounded-md bg-white border border-[#e7e1cf]"
        >
          Revert
        </button>
      </div>
    </div>
  );
}
