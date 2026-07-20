import { useEffect, useMemo, useRef, useState } from "react";
import { defaultPageData, type BusinessPageData, type MediaItem } from "./data";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
const assetUrl = (url: string) => url.startsWith("/") ? apiUrl(url) : url;

async function apiError(response: Response, fallback: string) {
  try {
    const body = await response.json() as { error?: string };
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

type Tab = "identity" | "story" | "services" | "media" | "contact" | "brand";
const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "identity", label: "Business", icon: "01" }, { id: "story", label: "Story", icon: "02" },
  { id: "services", label: "Services", icon: "03" }, { id: "media", label: "Photos & video", icon: "04" },
  { id: "contact", label: "Contact", icon: "05" }, { id: "brand", label: "Brand", icon: "06" },
];

export default function StudioEditor() {
  const [page, setPage] = useState<BusinessPageData>(defaultPageData);
  const [tab, setTab] = useState<Tab>("identity");
  const [state, setState] = useState<"loading" | "saved" | "dirty" | "saving" | "error">("loading");
  const [message, setMessage] = useState("");
  const [heroUploading, setHeroUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState("loading");
    fetch(apiUrl("/api/pages/luna-interior-design"))
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            setPage(defaultPageData);
            setState("saved");
            return;
          }
          throw new Error("Failed to load");
        }
        const data = await res.json();
        setPage(data);
        setState("saved");
      })
      .catch(() => {
        setState("error");
        setMessage("Could not load page details from backend. Using defaults.");
      });
  }, []);
  const update = <K extends keyof BusinessPageData>(key: K, value: BusinessPageData[K]) => { setPage(current => ({ ...current, [key]: value })); setState("dirty"); };
  const initials = useMemo(() => page.businessName.split(/\s+/).slice(0, 2).map(x => x[0]).join(""), [page.businessName]);

  function save(status = page.status) {
    setState("saving"); setMessage("");
    const payload = { ...page, status };
    fetch(apiUrl("/api/pages"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Save failed");
        setPage(payload);
        setState("saved");
        setMessage(status === "published" ? "Published successfully." : "Draft saved successfully.");
      })
      .catch(() => {
        setState("error");
        setMessage("Failed to save page to backend.");
      });
  }

  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setMessage("Choose a file smaller than 10 MB."); return; }
    setMessage("Uploading media…");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(apiUrl("/api/upload"), {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      const media: MediaItem = { id: crypto.randomUUID(), type: file.type.startsWith("video/") ? "video" : "image", url, alt: file.name.replace(/\.[^.]+$/, ""), title: file.name.replace(/\.[^.]+$/, "") };
      update("media", [...page.media, media]);
      setMessage("Media added. Save your draft to keep it.");
    } catch {
      setMessage("Failed to upload image or video to the backend.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function uploadHero(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setMessage("Choose a valid image file."); return; }
    if (file.size > 10 * 1024 * 1024) { setMessage("Choose a file smaller than 10 MB."); return; }
    setMessage("Uploading cover image…");
    setHeroUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(apiUrl("/api/upload/image"), {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await apiError(res, "Upload failed"));
      const { url } = await res.json();
      update("heroImage", url);
      setMessage("Cover image updated. Save your draft to keep it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to upload cover image to the backend.");
    } finally {
      setHeroUploading(false);
      if (heroFileRef.current) heroFileRef.current.value = "";
    }
  }

  return <main className="real-editor" style={{ "--accent": page.accent } as React.CSSProperties}>
    <header className="real-topbar"><a href="/studio" className="brand">PAGE <span>STUDIO</span></a><div className="page-address"><span>PUBLIC PAGE</span><strong>/p/{page.slug}</strong></div><div className="real-actions"><span className={`editor-state ${state}`}>{state === "loading" ? "Loading…" : state === "saving" ? "Saving…" : state === "dirty" ? "Unsaved changes" : state === "error" ? "Needs attention" : "All changes saved"}</span><button className="button secondary" onClick={() => save("draft")} disabled={state === "saving"}>Save draft</button><a className="button secondary" href={`/p/${page.slug}?preview=1`} target="_blank">Preview ↗</a><button className="button primary" onClick={() => save("published")} disabled={state === "saving"}>Publish</button></div></header>
    <div className="real-workspace">
      <aside className="real-sidebar"><div className="workspace-label"><small>EDITING</small><strong>{page.businessName || "Untitled page"}</strong><span>{page.status === "published" ? "Published" : "Draft"}</span></div><nav>{tabs.map(item => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><b>{item.icon}</b><span>{item.label}</span></button>)}</nav><div className="completion"><span>PAGE COMPLETION</span><div><i style={{ width: `${Math.min(100, 45 + page.services.length * 8 + page.media.length * 5)}%` }} /></div><small>Add complete, accurate information before publishing.</small></div></aside>
      <section className="real-form"><header><p>PAGE CONTENT / {tab.toUpperCase()}</p><h1>{tabs.find(item => item.id === tab)?.label}</h1><span>{tab === "media" ? "Upload the work customers should see. Images and videos appear only on your public page." : "Changes appear in the preview as you type. Save when you are ready."}</span></header>{message && <div className="editor-message">{message}</div>}
        {tab === "identity" && <div className="form-stack"><Field label="Business name" value={page.businessName} onChange={v => update("businessName", v)} /><Field label="Page address" prefix="pagestudio.local/p/" value={page.slug} onChange={v => update("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, ""))} /><Field label="Business category" value={page.category} onChange={v => update("category", v)} /><Field label="Main headline" value={page.tagline} onChange={v => update("tagline", v)} /><Field label="Established year" value={page.established} onChange={v => update("established", v)} /></div>}
        {tab === "story" && <div className="form-stack"><Field label="Story headline" value={page.storyTitle} onChange={v => update("storyTitle", v)} /><Field label="Business story" value={page.story} onChange={v => update("story", v)} textarea /><div className="hero-upload-field"><Field label="Hero image URL" value={page.heroImage} onChange={v => update("heroImage", v)} /><input ref={heroFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={e => uploadHero(e.target.files?.[0])} /><button type="button" className="button secondary" style={{ marginTop: "0.5rem" }} disabled={heroUploading} onClick={() => heroFileRef.current?.click()}>{heroUploading ? "Uploading…" : "Upload cover image"}</button></div><p className="field-help">Upload a JPG, PNG, WebP or GIF up to 10 MB. Save the page after the upload completes.</p></div>}
        {tab === "services" && <div className="form-stack">{page.services.map((service, index) => <div className="repeat-card" key={service.id}><span>{String(index + 1).padStart(2, "0")}</span><div><Field label="Service title" value={service.title} onChange={v => update("services", page.services.map(s => s.id === service.id ? { ...s, title: v } : s))} /><Field label="Description" value={service.description} onChange={v => update("services", page.services.map(s => s.id === service.id ? { ...s, description: v } : s))} textarea /></div><button onClick={() => update("services", page.services.filter(s => s.id !== service.id))}>Remove</button></div>)}<button className="add-service" onClick={() => update("services", [...page.services, { id: crypto.randomUUID(), title: "New service", description: "Describe what you offer and who it helps." }])}>＋ Add service</button></div>}
        {tab === "media" && <div className="form-stack"><input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={e => upload(e.target.files?.[0])} /><button className="media-drop" onClick={() => fileRef.current?.click()}><b>＋ Choose image or video</b><span>Frontend demo · files up to 10 MB</span></button><div className="media-editor-grid">{page.media.map(item => <article key={item.id}>{item.type === "video" ? <video src={item.url} controls /> : <img src={item.url} alt={item.alt} />}<div><input aria-label="Media title" value={item.title} onChange={e => update("media", page.media.map(m => m.id === item.id ? { ...m, title: e.target.value } : m))} /><button onClick={() => update("media", page.media.filter(m => m.id !== item.id))}>Remove</button>{item.type === "image" && <button onClick={() => update("heroImage", item.url)}>Use as cover</button>}</div></article>)}</div></div>}
        {tab === "contact" && <div className="form-stack"><Field label="Public email" value={page.email} onChange={v => update("email", v)} /><Field label="Phone number" value={page.phone} onChange={v => update("phone", v)} /><Field label="WhatsApp number" value={page.whatsapp} onChange={v => update("whatsapp", v)} /><Field label="Instagram URL" value={page.instagram} onChange={v => update("instagram", v)} /><Field label="Business address" value={page.address} onChange={v => update("address", v)} textarea /><Field label="Opening hours" value={page.hours} onChange={v => update("hours", v)} /></div>}
        {tab === "brand" && <div className="form-stack"><div className="brand-mark">{initials || "PS"}</div><label className="field"><span>Brand accent</span><div className="color-row"><input type="color" value={page.accent} onChange={e => update("accent", e.target.value)} /><input value={page.accent} onChange={e => update("accent", e.target.value)} /></div></label><div className="theme-card selected"><div className="theme-swatch light" /><span><strong>Editorial light</strong><small>Responsive premium business template</small></span><b>✓</b></div></div>}
      </section>
      <aside className="real-preview"><header><span><i /> LIVE CONTENT PREVIEW</span><a href={`/p/${page.slug}`} target="_blank">Full page ↗</a></header><div className="preview-browser"><div className="preview-url">pagestudio.local/p/{page.slug}</div><div className="mini-site"><div className="mini-cover" style={{ backgroundImage: `linear-gradient(90deg,transparent,#0002),url('${assetUrl(page.heroImage)}')` }} /><div className="mini-copy"><p>{page.category}</p><h2>{page.tagline || page.businessName}</h2><span>{page.businessName}</span></div><div className="mini-story"><p>OUR STORY</p><h3>{page.storyTitle}</h3><span>{page.story}</span></div><div className="mini-services">{page.services.slice(0, 3).map((s, i) => <div key={s.id}><b>0{i + 1}</b><strong>{s.title}</strong></div>)}</div></div></div></aside>
    </div>
  </main>;
}

function Field({ label, value, onChange, textarea, prefix }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean; prefix?: string }) { return <label className="field"><span>{label}</span><div className={prefix ? "prefixed-input" : ""}>{prefix && <small>{prefix}</small>}{textarea ? <textarea rows={4} value={value} onChange={e => onChange(e.target.value)} /> : <input value={value} onChange={e => onChange(e.target.value)} />}</div></label>; }
