import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export const Auth = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Signed in successfully!')
    }
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Account created! Check your email to confirm.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Authentication</h2>
      
      <form onSubmit={handleSignIn} className="space-y-4 mb-6">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <button
        onClick={handleSignUp}
        disabled={loading}
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
          {message}
        </div>
      )}
    </div>
  )
}
