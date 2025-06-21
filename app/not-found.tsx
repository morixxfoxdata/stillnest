import Link from 'next/link'

export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1 style={{ 
              fontSize: '4rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: '#000000'
            }}>
              404
            </h1>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#333333'
            }}>
              ページが見つかりません
            </h2>
            <p style={{ 
              color: '#666666', 
              marginBottom: '2rem',
              maxWidth: '400px'
            }}>
              お探しのページは存在しないか、移動された可能性があります。
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#000000',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500'
              }}
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}