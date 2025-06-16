import { FC } from 'react'
import Link from 'next/link'

// -> Simplist and floating footer, not breaking the 100vh

const Footer: FC = () => {
  return (
    <div className="fixed top-0 buttom-auto sm:top-auto sm:bottom-0 left-0 w-full z-50 pointer-events-none">
      <p className="text-center text-sm text-white drop-shadow-[0_0_3px_black] bg-transparent py-1 pointer-events-auto">
        Website by <Link href="https://hanny.vip" target="_blank" className="font-bold text-blue-300">Hanny Zhang</Link> <i className="bi bi-c-circle text-xs" /> 2025
      </p>
    </div>
  )
}

export default Footer
