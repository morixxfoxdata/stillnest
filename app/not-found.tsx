import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          ページが見つかりません
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}