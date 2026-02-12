import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

function HomeLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname.includes(path)

  return (
    <div className='w-screen h-screen flex flex-col bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='flex justify-between items-center px-6 py-4'>
          <h1 className='font-bold text-3xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'>
            MetaCare
          </h1>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold'>
              U
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar */}
        <aside className='bg-white border-r border-gray-200 w-[220px] flex flex-col'>
          <nav className='p-4 flex flex-col gap-2'>
            <button
              className={`
                px-4 py-4 rounded-lg text-left font-medium transition-all duration-200
                ${isActive('/home/appointments')
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 pl-3'
                  : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                }
              `}
              onClick={() => navigate('/home/appointments')}
            >
              <div className='flex items-center gap-3'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                </svg>
                <span>Appointments</span>
              </div>
            </button>

            <button
              className={`
                px-4 py-4 rounded-lg text-left font-medium transition-all duration-200
                ${isActive('/home/requests')
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 pl-3'
                  : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                }
              `}
              onClick={() => navigate('/home/requests')}
            >
              <div className='flex items-center gap-3'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                </svg>
                <span>Connections</span>
              </div>
            </button>

            <button
              className={`
                px-4 py-4 rounded-lg text-left font-medium transition-all duration-200
                ${isActive('/home/summaries')
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 pl-3'
                  : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                }
              `}
              onClick={() => navigate('/home/summaries')}
            >
              <div className='flex items-center gap-3'>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6M8 2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2z"
                  />
                </svg>

                <span>summaries</span>
              </div>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className='flex-1 overflow-auto bg-gray-50'>
          <div className='p-6 max-w-7xl mx-auto'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default HomeLayout