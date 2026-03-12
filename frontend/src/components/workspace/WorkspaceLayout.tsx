import { ReactNode } from 'react'
import Navbar from '../shared/Navbar'

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
