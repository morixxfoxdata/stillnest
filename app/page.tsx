import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Stillnest
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            写真に集中する、静かなSNS
          </p>
          <p className="text-base sm:text-lg text-gray-500 mb-8 sm:mb-12 px-4">
            A quiet SNS focused on photography
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link 
              href="/auth/signup"
              className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-center"
            >
              はじめる
            </Link>
            <Link 
              href="/auth/login"
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
            >
              ログイン
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}