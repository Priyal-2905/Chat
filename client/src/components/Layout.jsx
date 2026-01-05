import { Children } from "react"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"

const Layout = ({children,showSidebar = false}) => {
  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && <Sidebar/>}
        <div className="flex-1 flex flex-col">
          <Navbar/>
          <main>
            {children}
          </main>
        </div>
      </div>

    </div>
  )
}

export default Layout