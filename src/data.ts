export type ServiceItem = { id: string; title: string; description: string };
export type MediaItem = { id: string; type: "image" | "video"; url: string; alt: string; title: string };

export type BusinessPageData = {
  slug: string;
  status: "draft" | "published";
  businessName: string;
  category: string;
  tagline: string;
  established: string;
  storyTitle: string;
  story: string;
  heroImage: string;
  services: ServiceItem[];
  media: MediaItem[];
  address: string;
  hours: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  accent: string;
};

export const defaultPageData: BusinessPageData = {
  slug: "luna-interior-design", status: "draft", businessName: "Luna Interior Design",
  category: "Interior design studio", tagline: "Spaces shaped around you.", established: "2012",
  storyTitle: "Thoughtful design. Timeless character.",
  story: "We believe the best spaces feel inevitable—beautiful without trying too hard, and personal without following trends. From first sketch to final styling, our studio brings clarity, warmth and close attention to every project.",
  heroImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=88",
  services: [
    { id: "service-1", title: "Space Planning", description: "Layouts that balance beauty, flow and the practical rhythms of daily life." },
    { id: "service-2", title: "Material Selection", description: "A refined palette of honest finishes, custom details and lasting pieces." },
    { id: "service-3", title: "Project Management", description: "Calm oversight from concept and procurement through installation." },
  ],
  media: [
    { id: "sample-1", type: "image", title: "Calm House", alt: "Calm House interior", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85" },
    { id: "sample-2", type: "image", title: "Summit Loft", alt: "Summit Loft interior", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85" },
    { id: "sample-3", type: "image", title: "Oak Residence", alt: "Oak Residence interior", url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85" },
  ],
  address: "421 Architectural Way\nDesign District, CA 90210", hours: "Monday–Friday, 9:00 AM–5:00 PM",
  email: "studio@lunainteriors.com", phone: "+14155550138", whatsapp: "14155550138", instagram: "https://instagram.com/",
  accent: "#173c32",
};
