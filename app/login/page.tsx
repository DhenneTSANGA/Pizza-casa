import AuthForm from '@/components/auth/AuthForm'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="mt-2 text-gray-600">Accédez à votre compte</p>
        </div>
        <Suspense fallback={
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ac1f1f]"></div>
          </div>
        }>
          <AuthForm type="login" />
        </Suspense>
      </div>
    </div>
  )
}