import { Outlet } from "react-router-dom"

function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <Outlet/>        
      </div>
    </div>
  )
}

export default AuthLayout
