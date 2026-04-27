import React, { useMemo, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../services/firebase";

const VARIANTS = [
  { id: "custom", label: "Custom (title + description + optional images)" },
  { id: "simple", label: "Simple (title only)" },
  { id: "long", label: "Long description" },
  { id: "professional", label: "Professional (structured)" },
];

export default function PostEditor({ initial, onSave, onCancel, uid }) {
  const init = initial || {};
  const [type, setType] = useState(init.type || "offer");
  const [variant, setVariant] = useState(init.variant || "custom");
  const [title, setTitle] = useState(init.title || "");
  const [category, setCategory] = useState(init.category || "");
  const [budget, setBudget] = useState(typeof init.budget === "number" ? String(init.budget) : "");
  const [description, setDescription] = useState(init.description || "");
  const [contactInfo, setContactInfo] = useState(init.contactInfo || "");
  const [pro, setPro] = useState(init.pro || { deliverables: "", timeline: "", tools: "", experience: "" });
  const [images] = useState(Array.isArray(init.images) ? init.images : []);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const showDesc = variant !== "simple";
  const showPro = variant === "professional";
  const showImages = variant === "custom";

  const parsedBudget = useMemo(() => {
    const n = Number(budget);
    return Number.isFinite(n) ? n : null;
  }, [budget]);

  async function uploadSelected() {
    if (!files?.length) return [];
    const urls = [];
    for (const file of files) {
      const path = `postImages/${uid}/${Date.now()}-${file.name}`;
      const r = ref(storage, path);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      urls.push(url);
    }
    return urls;
  }

  async function handleSave(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      let uploaded = [];
      if (showImages && files.length) uploaded = await uploadSelected();
      const next = {
        type,
        variant,
        title: title.trim(),
        category: category.trim(),
        budget: parsedBudget === null ? null : parsedBudget,
        description: showDesc ? description.trim() : "",
        contactInfo: contactInfo.trim(),
        pro: showPro ? {
          deliverables: pro.deliverables || "",
          timeline: pro.timeline || "",
          tools: pro.tools || "",
          experience: pro.experience || ""
        } : null,
        images: showImages ? [...images, ...uploaded] : [],
      };
      await onSave(next);
    } catch (e2) {
      setErr(e2?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="card pad grid" style={{ gap: 12 }}>
      <div className="h2">{initial ? "Edit post" : "Create post"}</div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="grid">
          <div className="small">Post type</div>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="offer">Offer a service</option>
            <option value="request">Looking for a service</option>
          </select>
        </div>
        <div className="grid">
          <div className="small">Format</div>
          <select value={variant} onChange={e => setVariant(e.target.value)}>
            {VARIANTS.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="grid">
          <div className="small">Title</div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., I will build a React dashboard" />
        </div>
        <div className="grid">
          <div className="small">Category</div>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., Web Development" />
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="grid">
          <div className="small">Budget (optional)</div>
          <input value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g., 150" />
        </div>
        <div className="grid">
          <div className="small">Preview</div>
          <div className="pill">{type} · {variant}</div>
        </div>
      </div>

      {showDesc ? (
        <div className="grid">
          <div className="small">Description</div>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6}
            placeholder={variant === "long" ? "Write a detailed description…" : "Describe your post…"} />
        </div>
      ) : null}

      <div className="grid">
        <div className="small">Contact information</div>
        <textarea
          value={contactInfo}
          onChange={e => setContactInfo(e.target.value)}
          rows={4}
          placeholder="Example: Email, Discord, Telegram, website."
        />
      </div>

      {showPro ? (
        <div className="grid" style={{ gap: 10 }}>
          <div className="small">Professional fields</div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="grid">
              <div className="small">Deliverables</div>
              <textarea value={pro.deliverables} onChange={e => setPro(p => ({...p, deliverables: e.target.value}))} rows={4} />
            </div>
            <div className="grid">
              <div className="small">Timeline</div>
              <textarea value={pro.timeline} onChange={e => setPro(p => ({...p, timeline: e.target.value}))} rows={4} />
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="grid">
              <div className="small">Tools</div>
              <textarea value={pro.tools} onChange={e => setPro(p => ({...p, tools: e.target.value}))} rows={4} />
            </div>
            <div className="grid">
              <div className="small">Experience</div>
              <textarea value={pro.experience} onChange={e => setPro(p => ({...p, experience: e.target.value}))} rows={4} />
            </div>
          </div>
        </div>
      ) : null}

      {showImages ? (
        <div className="grid" style={{ gap: 10 }}>
          <div className="small">Images (optional)</div>
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          <div className="small muted">Requires Firebase Storage enabled.</div>
        </div>
      ) : null}

      {err ? <div className="small" style={{ color: "var(--danger)" }}>{err}</div> : null}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button type="button" className="btn" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="btn primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
