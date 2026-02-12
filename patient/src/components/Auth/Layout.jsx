import { Outlet } from "react-router-dom"

function AuthLayout() {
  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white h-full rounded-lg shadow-xl w-full ">
        <Outlet/>        
      </div>
    </div>
  )
}

export default AuthLayout
