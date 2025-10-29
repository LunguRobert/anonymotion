// app/page.jsx — Server Component only (no "use client")
import HeroCloud from "@/components/marketing/HeroCloud";
import MindfulMinute from "@/components/marketing/MindfulMinute";
import PremiumBento from "@/components/marketing/PremiumBento";
import SafetyPledges from "@/components/marketing/SafetyPledges";
import FaqPlain from "@/components/marketing/FaqPlain";
import FinalCta from "@/components/marketing/FinalCta";
import DemoFeedIsland from '@/components/marketing/DemoFeedIsland'
import FaqSchema from '@/components/marketing/FaqSchema'
import BlogTeaser from '@/components/marketing/BlogTeaser'
import MindConstellation from "@/components/marketing/MindConstellation";
import { getLatestPosts } from '@/lib/blog'

export const revalidate = 86400; // ISR, 1 zi

// app/page.jsx
export const metadata = {
  title: "Anonymotion — write how you feel, anonymously",
  description:
    "A calm, anonymous space to express feelings, get supportive reactions, and (with Premium) track mood trends with a private journal.",
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Anonymotion — anonymous posts & private mood journal",
    description:
      "Write anonymously, get reactions, and with Premium understand your mood patterns.",
    url: "/",
    type: "website",
    images: ["/og-image.png"], // <- important
  },
  twitter: {
    card: "summary_large_image",
    title: "Anonymotion — anonymous posts & private mood journal",
    description:
      "Write anonymously, get reactions, and with Premium understand your mood patterns.",
    images: ["/og-image.png"], // <- important
  },
  robots: {
    index: true, follow: true,
    googleBot: {
      index: true, follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/site.webmanifest",
};


// JSON-LD (Organization, WebSite, WebPage, FAQ) — server-rendered
function JsonLd() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://anonymotions.com";

  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Anonymotion",
      url: base,
      logo: `${base}/og-image.png`,
      sameAs: [
        // adaugă dacă ai
        // "https://x.com/…",
        // "https://www.linkedin.com/company/…"
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Anonymotion",
      url: base,
      potentialAction: {
        "@type": "SearchAction",
        target: `${base}/blog?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Anonymotion — write how you feel, anonymously",
      url: `${base}/`,
      description:
        "A calm, anonymous space to express feelings, get reactions, and track mood with a private journal.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Anonymotion",
      url: base,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0.00",
        priceCurrency: "USD",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SiteNavigationElement",
      name: ["Home", "Feed", "Blog", "Journal"],
      url: [`${base}/`, `${base}/feed`, `${base}/blog`, `${base}/user`],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}


export default async function HomePage({ searchParams }) {
  const sp = await searchParams;
  const demoRaw = typeof sp?.get === "function" ? sp.get("demo") : sp?.demo;
  const showDemo = demoRaw === "1";

  const posts = await getLatestPosts(3);

  return (
    <main className="bg-background">
      <HeroCloud />
      {showDemo && (
        <section id="demo" className="scroll-mt-24">
          <DemoFeedIsland />
        </section>
      )}
      {/* <MetricsRow /> */}
      <MindfulMinute />

      <PremiumBento />

      <MindConstellation />

      <SafetyPledges />

      <BlogTeaser items={posts} />

      <FaqPlain />

      <FaqSchema items={[
        {
          q: "Is my identity shown anywhere?",
          a: "No. Posts display only your text and the selected mood. There are no public profiles or follower counts. Sign-in is required only to reduce spam and help moderation.",
        },
        {
          q: "Do I need an account to write?",
          a: "Yes—an account is required to post or react, but your identity is never shown on the feed. This keeps spam low and enables rate-limiting and reporting.",
        },
        {
          q: "What does Premium unlock?",
          a: "A private journal, advanced insights and trends, and extra controls. Posting anonymously to the public feed works on the free plan. Exports and delete are available from your account.",
        },
        {
          q: "How are posts moderated?",
          a: "Every post has a one-tap report. Repeated flags auto-hide content until review. Clear community guidelines help keep the space calm and kind.",
        },
        {
          q: "Can I export or delete my data?",
          a: "Yes. You can export entries and reactions (CSV/JSON/TXT) and delete entries from your account anytime. Data is encrypted in transit via HTTPS.",
        },
        {
          q: "Is Anonymotion a substitute for therapy?",
          a: "No. It can complement professional care, but it is not a replacement. If you’re in crisis, contact local support lines or a clinician.",
        },
      ]} />
      <FinalCta />

      {/* SEO JSON-LD */}
      <JsonLd />
    </main>
  );
}
