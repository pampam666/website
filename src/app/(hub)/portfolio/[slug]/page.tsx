import { getPortfolioBySlug, getPortfolioEntries } from '@/lib/api/sanity/queries'
import { getOptimizedImageUrl } from '@/lib/api/sanity/image'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600 // Revalidate hourly

export async function generateStaticParams() {
  const entries = await getPortfolioEntries()
  if (!entries) return []
  return entries.map((entry) => ({
    slug: entry.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = await getPortfolioBySlug(slug)
  if (!entry) return {}
  return {
    title: `${entry.seoMeta?.title || entry.title} - DBSN`,
    description: entry.seoMeta?.description || entry.outcome,
  }
}

interface PortableTextChild {
  text: string
}

interface PortableTextBlock {
  _type: string
  style?: string
  children?: PortableTextChild[]
}

function PortableTextRenderer({ value }: { value: unknown }) {
  if (!Array.isArray(value)) return null

  return (
    <div className="space-y-4 text-slate-700 leading-relaxed">
      {(value as PortableTextBlock[]).map((block, idx) => {
        if (block._type !== 'block') return null

        const text = block.children?.map((child) => child.text).join('') || ''
        
        if (block.style === 'h1') return <h1 key={idx} className="text-3xl font-bold text-slate-900 mt-6 mb-2">{text}</h1>
        if (block.style === 'h2') return <h2 key={idx} className="text-2xl font-bold text-slate-900 mt-5 mb-2">{text}</h2>
        if (block.style === 'h3') return <h3 key={idx} className="text-xl font-bold text-slate-900 mt-4 mb-2">{text}</h3>
        if (block.style === 'h4') return <h4 key={idx} className="text-lg font-bold text-slate-900 mt-3 mb-2">{text}</h4>
        
        return <p key={idx} className="text-base">{text}</p>
      })}
    </div>
  )
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = await getPortfolioBySlug(slug)

  if (!entry) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4 flex gap-6">
          <Link href="/" className="font-bold text-slate-800 hover:text-blue-600">DBSN</Link>
          <Link href="/certifications" className="text-slate-600 hover:text-blue-600">Certifications</Link>
          <Link href="/portfolio" className="text-slate-600 hover:text-blue-600">Portfolio</Link>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-8">
          <Link href="/portfolio" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            &larr; Kembali ke Portofolio
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-10 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                entry.clientCategory === 'Government' ? 'bg-blue-100 text-blue-800' :
                entry.clientCategory === 'BUMN' ? 'bg-purple-100 text-purple-800' :
                entry.clientCategory === 'Private' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {entry.clientCategory}
              </span>
              <span className="text-slate-400 text-sm">&bull;</span>
              <span className="text-slate-600 text-sm font-medium">{entry.projectType}</span>
              <span className="text-slate-400 text-sm">&bull;</span>
              <span className="text-slate-600 text-sm font-medium">{entry.location}</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              {entry.title}
            </h1>
          </div>

          {entry.images && entry.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entry.images.map((image, idx) => (
                <div key={image._key || idx} className="aspect-video w-full bg-slate-100 relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  <Image
                    src={getOptimizedImageUrl(image, 800, 450) || ''}
                    alt={`${entry.title} image ${idx + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition duration-500"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 border-t border-slate-100">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Deskripsi Proyek</h2>
                <PortableTextRenderer value={entry.scopeDescription} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Hasil & Dampak</h2>
                <p className="text-slate-700 leading-relaxed">{entry.outcome}</p>
              </div>
            </div>

            <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Informasi Proyek</h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-semibold">Tahun Penyelesaian</p>
                  <p className="text-slate-800 font-bold">{entry.completionYear}</p>
                </div>
                {entry.relatedSpoke && (
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-semibold">Spoke Terkait</p>
                    <p className="text-slate-800 font-bold capitalize">{entry.relatedSpoke.name}</p>
                  </div>
                )}
                {entry.relatedProducts && entry.relatedProducts.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Produk Terkait</p>
                    <ul className="space-y-1">
                      {entry.relatedProducts.map((prod) => (
                        <li key={prod._id}>
                          <Link
                            href={`/${entry.relatedSpoke?.subdomain || 'pju'}/products/${prod.slug}`}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          >
                            {prod.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
