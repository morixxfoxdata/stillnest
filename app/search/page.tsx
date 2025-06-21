import { Suspense } from 'react'
import SearchPageContent from './SearchPageContent'
import { CenteredLoading } from '@/components/ui/SkeletonLoader'

export default function SearchPage() {
  return (
    <Suspense fallback={<CenteredLoading message="Loading search..." />}>
      <SearchPageContent />
    </Suspense>
  )
}