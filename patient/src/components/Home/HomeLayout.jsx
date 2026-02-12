import React from 'react'
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"

function HomeLayout({ scheduleNotification }) {
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path) => location.pathname.includes(path)

    const navItems = [
        { path: '/home/appointment', label: 'Appointment', icon: '📅' },
        { path: '/home/diet', label: 'Diet', icon: '🥗' }
    ]

    return (
        <div className='w-screen h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50'>
            {/* Header */}
            <div className='flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200 shadow-sm'>
                <div className='flex justify-between w-full'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center'>
                            <span className='text-white font-bold text-xl'>M</span>
                        </div>
                        <h2 className='font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                            MetaCare
                        </h2>
                    </div>
                    <Button varient="outline" className="bg-white" >
                        Logout
                    </Button>
                </div>

            </div>

            {/* Main Content */}
            <div className='flex flex-1 overflow-hidden'>
                {/* Sidebar */}
                <div className='bg-white border-r border-gray-200 p-4 flex flex-col gap-3 w-[220px] shadow-sm'>
                    {navItems.map((item) => {
                        const active = isActive(item.path)

                        return (
                            <button
                                key={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3.5 rounded-xl 
                                    transition-all duration-200 font-medium text-left
                                    ${active
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105'
                                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm hover:scale-102'
                                    }
                                `}
                                onClick={() => navigate(item.path)}
                            >
                                <span className='text-xl'>{item.icon}</span>
                                <span className='text-sm'>{item.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Content Area */}
                <div className='flex-1 overflow-auto bg-gradient-to-br from-blue-50 to-indigo-50'>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default HomeLayout