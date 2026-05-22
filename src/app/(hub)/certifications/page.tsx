import { getCertifications } from '@/lib/api/sanity/queries'
import { getOptimizedImageUrl } from '@/lib/api/sanity/image'
import { getSanityEnv } from '@/lib/config/env'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 3600 // Revalidate hourly

export const metadata: Metadata = {
  title: 'Daftar Sertifikasi & Kepatuhan - DBSN',
  description: 'Daftar sertifikasi resmi produk DBSN termasuk SNI, TKDN, LKPP, dan ISO untuk standar proyek energi terbarukan di Indonesia.',
}

export default async function CertificationsPage() {
  const certifications = await getCertifications()
  const { SANITY_PROJECT_ID, SANITY_DATASET } = getSanityEnv()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4 flex gap-6">
          <Link href="/" className="font-bold text-slate-800 hover:text-blue-600">DBSN</Link>
          <Link href="/certifications" className="text-blue-600 font-medium">Certifications</Link>
          <Link href="/portfolio" className="text-slate-600 hover:text-blue-600">Portfolio</Link>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Sertifikasi & Kepatuhan
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Komitmen kami terhadap standar nasional dan internasional untuk menjamin keandalan, keselamatan, dan kualitas produk energi terbarukan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certifications && certifications.length > 0 ? (
            certifications.map((cert) => (
              <div
                key={cert._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="aspect-video w-full bg-slate-100 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center">
                    {cert.coverImage ? (
                      <Image
                        src={getOptimizedImageUrl(cert.coverImage, 400, 225) || ''}
                        alt={cert.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-bold text-slate-300">{cert.certType}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {cert.certType}
                      </span>
                      <span className="text-xs text-slate-500">{cert.certificationBody}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 leading-snug">
                      {cert.title}
                    </h2>
                  </div>
                </div>
                
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex justify-between items-center text-sm">
                  <div className="text-slate-600">
                    <p className="text-xs text-slate-400">Berlaku Hingga</p>
                    <p className="font-medium">
                      {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) : 'Seumur Hidup'}
                    </p>
                  </div>
                  {cert.documentFile && (
                    <a
                      href={`https://cdn.sanity.io/files/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${cert.documentFile.asset._ref}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Lihat Dokumen
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className="text-slate-500 text-lg">Belum ada sertifikasi yang terindeks.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
