import { getPublishedFaqs, getPublishedArticles } from "@/lib/data";
import { HomeClient } from "@/components/katebkar/home-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [faqs, articles] = await Promise.all([
    getPublishedFaqs(),
    getPublishedArticles(),
  ]);

  // FAQPage schema for rich results
  const faqJsonLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <HomeClient faqs={faqs} articles={articles} />
    </>
  );
}
