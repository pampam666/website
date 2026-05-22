import { getPortfolioEntries } from '@/lib/api/sanity/queries'
import { getOptimizedImageUrl } from '@/lib/api/sanity/image'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 3600 // Revalidate hourly

export const metadata: Metadata = {
  title: 'Portofolio Proyek Terbarukan - DBSN',
  description: 'Jelajahi portofolio proyek energi terbarukan kami untuk sektor B2G, B2B, dan swasta di seluruh Indonesia.',
}

export default async function PortfolioPage() {
  const portfolio = await getPortfolioEntries()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4 flex gap-6">
          <Link href="/" className="font-bold text-slate-800 hover:text-blue-600">DBSN</Link>
          <Link href="/certifications" className="text-slate-600 hover:text-blue-600">Certifications</Link>
          <Link href="/portfolio" className="text-blue-600 font-medium">Portfolio</Link>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Portofolio Proyek
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Jelajahi proyek-proyek sukses kami yang telah menerangi jalan-jalan dan memberdayakan industri di seluruh kepulauan Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolio && portfolio.length > 0 ? (
            portfolio.map((entry) => (
              <div
                key={entry._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {entry.images?.[0] ? (
                      <Image
                        src={getOptimizedImageUrl(entry.images[0], 400, 225) || ''}
                        alt={entry.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-bold text-slate-300">🏢</span>
                    )}
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        entry.clientCategory === 'Government' ? 'bg-blue-100 text-blue-800' :
                        entry.clientCategory === 'BUMN' ? 'bg-purple-100 text-purple-800' :
                        entry.clientCategory === 'Private' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.clientCategory}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{entry.location}</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900 leading-snug">
                      {entry.title}
                    </h2>
                    
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {entry.outcome}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Selesai: {entry.completionYear}</span>
                  <Link
                    href={`/portfolio/${entry.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    Detail Proyek &rarr;
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className="text-slate-500 text-lg">Belum ada portofolio proyek yang terindeks.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
