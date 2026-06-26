import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

async function getPage(slug: string) {
  return prisma.page.findFirst({ where: { slug, published: true } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: page.seoTitleEn ?? page.titleEn,
    description: page.seoDescEn ?? undefined,
  };
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-stone-800 mb-8">{page.titleEn}</h1>
        <div
          className="prose prose-stone max-w-none text-stone-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-stone-800 [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1"
          dangerouslySetInnerHTML={{ __html: page.contentEn }}
        />
      </div>
      <Footer />
    </main>
  );
}
