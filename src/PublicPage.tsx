import { useEffect, useState } from "react";
import { defaultPageData, type BusinessPageData } from "./data";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
const assetUrl = (url: string) => url.startsWith("/") ? apiUrl(url) : url;

export default function PublicBusinessPage() {
  const [page, setPage] = useState<BusinessPageData>(defaultPageData); const [menuOpen, setMenuOpen] = useState(false); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => {
    const slug = window.location.pathname.split("/")[2] || "luna-interior-design";
    const preview = new URLSearchParams(window.location.search).get("preview") === "1";

    fetch(apiUrl(`/api/pages/${slug}`))
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            if (slug === defaultPageData.slug) {
              setPage(defaultPageData);
              return;
            }
            throw new Error("Page not found");
          }
          throw new Error("Failed to load page");
        }
        const data = (await res.json()) as BusinessPageData;
        if (!preview && data.status !== "published") {
          throw new Error("This page is still a draft. Publish it from the editor first.");
        }
        setPage(data);
      })
      .catch((err) => {
        setError(err.message || "The saved demo page could not be read.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  if (loading) return <main className="public-loading">Loading business page…</main>;
  if (error) return <main className="public-loading"><div><strong>Page not available</strong><p>{error}</p><a href="/studio">Return to Page Studio</a></div></main>;
  const initials = page.businessName.split(/\s+/).slice(0, 2).map(x => x[0]).join("");
  return <main className="business-site" style={{ "--forest": page.accent } as React.CSSProperties}>
    <header className="business-header"><a className="business-logo" href="#home"><span>{initials}</span><div><strong>{page.businessName}</strong><small>{page.category}</small></div></a><nav><a href="#about">About</a><a href="#services">Services</a><a href="#gallery">Work</a><a href="#location">Location</a></nav><a className="header-cta" href="#contact">Get in touch</a><button className="menu-toggle" onClick={() => setMenuOpen(true)}>Menu</button></header>
    <section className="business-hero" id="home"><div className="business-hero-image" style={{ backgroundImage: `linear-gradient(90deg,transparent 70%,#0002),url('${assetUrl(page.heroImage)}')` }} /><div className="business-hero-copy"><p>{page.category} · EST. {page.established}</p><h1>{page.tagline}</h1><span>{page.story.slice(0, 180)}</span><a href="#gallery">Explore our work <b>↓</b></a></div></section>
    <section className="business-about" id="about"><div><p>OUR STORY</p><h2>{page.storyTitle}</h2></div><div><p>{page.story}</p><dl><div><dt>{page.services.length}</dt><dd>Services</dd></div><div><dt>{page.media.length}</dt><dd>Selected works</dd></div><div><dt>{page.established}</dt><dd>Established</dd></div></dl></div></section>
    {page.services.length > 0 && <section className="business-services" id="services"><header><p>WHAT WE DO</p><h2>How we can help.</h2></header><div className="services-list">{page.services.map((s, i) => <article key={s.id}><b>{String(i + 1).padStart(2, "0")}</b><h3>{s.title}</h3><p>{s.description}</p></article>)}</div></section>}
    {page.media.length > 0 && <section className="business-gallery" id="gallery"><header><div><p>SELECTED WORK</p><h2>Gallery</h2></div><span>A closer look at our recent business work and projects.</span></header><div className="project-grid">{page.media.map(item => <article key={item.id}>{item.type === "video" ? <video src={item.url} controls playsInline /> : <img src={item.url} alt={item.alt || item.title} />}<div><p>{item.type}</p><h3>{item.title}</h3></div></article>)}</div></section>}
    <section className="business-location" id="location"><div className="map-card"><span>{page.address}</span><b>LOCATION</b></div><div><p>VISIT US</p><h2>Come say hello.</h2><address>{page.address}</address><span>{page.hours}</span><a href={`https://maps.google.com/?q=${encodeURIComponent(page.address)}`} target="_blank">Get directions ↗</a></div></section>
    <section className="business-contact" id="contact"><p>HOW CAN WE HELP?</p><h2>We&apos;d love to<br /><em>hear from you.</em></h2><div><a href={`mailto:${page.email}`}>{page.email}</a>{page.whatsapp && <a href={`https://wa.me/${page.whatsapp}`}>WhatsApp ↗</a>}{page.instagram && <a href={page.instagram}>Instagram ↗</a>}</div></section>
    <footer className="business-footer"><strong>{page.businessName}</strong><span>© 2026 · Made with Page Studio</span><a href="#home">Back to top ↑</a></footer>
    <div className="mobile-actions"><a href={`tel:${page.phone}`}>Call</a><a href={`https://wa.me/${page.whatsapp}`}>WhatsApp</a><a href={`mailto:${page.email}`}>Email</a></div>
    <div className={`mobile-menu ${menuOpen ? "open" : ""}`}><button onClick={() => setMenuOpen(false)}>Close</button><nav>{["About", "Services", "Gallery", "Location", "Contact"].map(item => <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{item}</a>)}</nav><small>{page.businessName} · {page.category}</small></div>
  </main>;
}
