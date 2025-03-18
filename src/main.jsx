import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './components/Router.jsx'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify'
import AuthProvider from './components/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <RouterProvider router={router}></RouterProvider>
    <ToastContainer></ToastContainer>
    </AuthProvider>
  </StrictMode>,
)
