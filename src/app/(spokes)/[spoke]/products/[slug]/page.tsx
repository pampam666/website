import { getProductBySlug, getSpokeConfig, getProductsBySpoke, getAllSpokeConfigs } from '@/lib/api/sanity/queries'
import { getOptimizedImageUrl } from '@/lib/api/sanity/image'
import { getSanityEnv } from '@/lib/config/env'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600 // Revalidate hourly

export async function generateStaticParams() {
  const configs = await getAllSpokeConfigs()
  if (!configs) return []

  const params: Array<{ spoke: string; slug: string }> = []

  for (const cfg of configs) {
    const products = await getProductsBySpoke(cfg.subdomain)
    if (products) {
      products.forEach((prod) => {
        params.push({
          spoke: cfg.subdomain,
          slug: prod.slug,
        })
      })
    }
  }

  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ spoke: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: `${product.seoMeta?.title || product.title} - DBSN`,
    description: product.seoMeta?.description || product.shortDescription,
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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ spoke: string; slug: string }>
}) {
  const { spoke, slug } = await params
  const [product, config] = await Promise.all([
    getProductBySlug(slug),
    getSpokeConfig(spoke),
  ])

  if (!product || !config) {
    notFound()
  }

  const { SANITY_PROJECT_ID, SANITY_DATASET } = getSanityEnv()
  const primaryColor = config.primaryColor || '#2563eb'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/" className="font-bold text-slate-800 hover:text-blue-600">DBSN Hub</Link>
              <span className="text-slate-300">&bull;</span>
              <Link href={`/${spoke}`} className="font-extrabold capitalize hover:opacity-85" style={{ color: primaryColor }}>
                {config.name}
              </Link>
            </div>
            <Link href={`/${spoke}`} className="text-sm font-semibold hover:underline" style={{ color: primaryColor }}>
              &larr; Kembali ke Spoke
            </Link>
          </nav>
        </header>

        <main className="container mx-auto px-6 py-12 max-w-6xl">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-10 space-y-10">
            
            {/* Product Header & Images */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Product Gallery */}
              <div className="space-y-4">
                {product.images && product.images.length > 0 ? (
                  <>
                    <div className="aspect-square w-full bg-slate-100 relative rounded-2xl overflow-hidden border border-slate-200">
                      <Image
                        src={getOptimizedImageUrl(product.images[0], 600, 600) || ''}
                        alt={product.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    {product.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {product.images.slice(1, 5).map((img, idx) => (
                          <div key={img._key || idx} className="aspect-square bg-slate-100 relative rounded-lg overflow-hidden border border-slate-200">
                            <Image
                              src={getOptimizedImageUrl(img, 150, 150) || ''}
                              alt={`${product.title} thumbnail ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-square w-full bg-slate-100 rounded-2xl flex items-center justify-center text-8xl text-slate-300 border border-slate-200">
                    🔆
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {product.title}
                  </h1>
                  <p className="text-lg text-slate-600">{product.shortDescription}</p>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100">
                  {product.specifications && product.specifications.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 mb-3">Spesifikasi Singkat</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {product.specifications.slice(0, 4).map((spec, idx) => (
                          <div key={idx} className="flex justify-between border-b border-slate-100 pb-1.5">
                            <span className="text-slate-400 font-medium">{spec.key}</span>
                            <span className="text-slate-800 font-bold">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {product.datasheetFile && (
                      <a
                        href={`https://cdn.sanity.io/files/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${product.datasheetFile.asset._ref}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-3.5 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Unduh Datasheet (PDF)
                      </a>
                    )}
                    <a
                      href={`https://wa.me/62XXXXXXXXX?text=Halo%20DBSN,%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(product.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-3.5 rounded-2xl font-bold text-sm bg-green-600 text-white hover:bg-green-700 transition"
                    >
                      Hubungi Sales (WA)
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details & Specifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10 border-t border-slate-100">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Deskripsi Lengkap</h2>
                  <PortableTextRenderer value={product.fullDescription} />
                </div>
              </div>

              {/* Full Specifications */}
              <div className="space-y-6">
                {product.specifications && product.specifications.length > 0 && (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Spesifikasi Lengkap</h2>
                    <table className="w-full text-sm">
                      <tbody>
                        {product.specifications.map((spec, idx) => (
                          <tr key={idx} className="border-b border-slate-100 last:border-0">
                            <td className="py-2.5 text-slate-400 font-medium">{spec.key}</td>
                            <td className="py-2.5 text-slate-800 font-bold text-right">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Certifications */}
                {product.relatedCertifications && product.relatedCertifications.length > 0 && (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Sertifikasi Produk</h2>
                    <ul className="space-y-2 text-sm font-semibold text-blue-600">
                      {product.relatedCertifications.map((cert) => (
                        <li key={cert._id}>
                          <Link href="/certifications" className="hover:underline flex items-center gap-1.5">
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">Sertifikat</span>
                            {cert.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} PT Sentra Daya Sinergi. Semua Hak Dilindungi.</p>
      </footer>
    </div>
  )
}
