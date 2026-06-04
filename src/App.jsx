import { Outlet } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { SiteBranding } from './components/system/SiteBranding'

export default function App() {
  return (
    <MainLayout>
      <SiteBranding />
      <Outlet />
    </MainLayout>
  )
}
