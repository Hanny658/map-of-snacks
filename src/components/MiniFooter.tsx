import { FC } from 'react'
import Link from 'next/link'

// -> Simplist and thinest footer

const Footer: FC = () => {
  return (
    <footer className="bg-orange-700 text-white">
      <div className="border-t border-white/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-sm text-white/75">
            Website by <Link href='https://hanny.vip'>Hanny Zhang</Link> <i className="bi bi-c-circle text-xs" /> 2025
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
