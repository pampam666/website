import { getCertifications, getPortfolioEntries } from '@/lib/api/sanity/queries'
import { getOptimizedImageUrl } from '@/lib/api/sanity/image'
import Image from 'next/image'
import Link from 'next/link'

export default async function HubHomePage() {
  const [certifications, portfolio] = await Promise.all([
    getCertifications() || [],
    getPortfolioEntries() || [],
  ])

  // Get unique certification types or list certifications
  const certTypes = Array.from(new Set(certifications?.map(c => c.certType) || []))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav className="container mx-auto px-6 py-4 flex gap-6">
          <Link href="/" className="font-bold text-slate-800 hover:text-blue-600">DBSN</Link>
          <Link href="/certifications" className="text-slate-600 hover:text-blue-600">Certifications</Link>
          <Link href="/portfolio" className="text-slate-600 hover:text-blue-600">Portfolio</Link>
        </nav>
      </header>

      <section className="container mx-auto px-6 py-16">
        <h1 className="text-5xl font-bold text-slate-800 mb-6">
          Solusi Energi Terbarukan untuk Masa Depan Indonesia
        </h1>
      </section>

      <section className="container mx-auto px-6 py-16 bg-white rounded-xl shadow-sm mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Sertifikasi & Kepatuhan</h2>
          <p className="text-slate-600">Produk kami memenuhi standar tertinggi regulasi Indonesia.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {certTypes.includes('SNI') && (
            <div className="border border-slate-200 rounded-lg p-6 text-center hover:shadow-md transition">
              <div className="text-4xl font-bold text-blue-600 mb-4">SNI</div>
              <p className="text-sm text-slate-600">Standar Nasional Indonesia</p>
            </div>
          )}
          {certTypes.includes('TKDN') && (
            <div className="border border-slate-200 rounded-lg p-6 text-center hover:shadow-md transition">
              <div className="text-4xl font-bold text-blue-600 mb-4">TKDN</div>
              <p className="text-sm text-slate-600">Tingkat Komponen Dalam Negeri</p>
            </div>
          )}
          {certTypes.includes('LKPP') && (
            <div className="border border-slate-200 rounded-lg p-6 text-center hover:shadow-md transition">
              <div className="text-4xl font-bold text-blue-600 mb-4">LKPP</div>
              <p className="text-sm text-slate-600">e-Katalog Barang dan Jasa Pemerintah</p>
            </div>
          )}
          {/* Fallback if no certifications fetched yet */}
          {certTypes.length === 0 && (
            <>
              <div className="border border-slate-200 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-4">SNI</div>
                <p className="text-sm text-slate-600">Standar Nasional Indonesia</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-4">TKDN</div>
                <p className="text-sm text-slate-600">Tingkat Komponen Dalam Negeri</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-4">LKPP</div>
                <p className="text-sm text-slate-600">Lembaga Pengadaan Barang/Jasa Pemerintah</p>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 bg-slate-50 rounded-xl mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Portofolio Proyek
          </h2>
          <p className="text-slate-600">
            Lebih dari 100 proyek sukses untuk pelanggan B2G dan B2B di Indonesia.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio && portfolio.length > 0 ? (
            portfolio.slice(0, 3).map((entry) => (
              <div key={entry._id} className="border border-slate-200 bg-white rounded-lg p-6 hover:shadow-lg transition flex flex-col justify-between">
                <div>
                  <div className="aspect-video w-full bg-slate-100 rounded mb-4 flex items-center justify-center relative overflow-hidden">
                    {entry.images?.[0] ? (
                      <Image
                        src={getOptimizedImageUrl(entry.images[0], 400, 225) || ''}
                        alt={entry.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-6xl font-bold text-slate-400">🏢</span>
                    )}
                  </div>
                  <div className="space-y-2 mb-4">
                    <h3 className="text-xl font-semibold text-slate-800">{entry.title}</h3>
                    <p className="text-sm text-slate-600">{entry.projectType} - {entry.location}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Client:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        entry.clientCategory === 'Government' ? 'bg-blue-100 text-blue-800' :
                        entry.clientCategory === 'BUMN' ? 'bg-purple-100 text-purple-800' :
                        entry.clientCategory === 'Private' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.clientCategory}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href={`/portfolio/${entry.slug}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    Lihat Detail &rarr;
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center col-span-full">Belum ada portofolio proyek.</p>
          )}
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <a href="https://wa.me/62XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-full hover:bg-green-700 shadow-lg transition">
          Chat via WhatsApp
        </a>
      </div>
    </div>
  )
}


