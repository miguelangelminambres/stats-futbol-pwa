import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Faltan las credenciales de Supabase')
  console.error('Por favor, asegúrate de:')
  console.error('1. Crear el archivo .env en la raíz del proyecto')
  console.error('2. Copiar las variables desde .env.example')
  console.error('3. Rellenar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY con tus credenciales')
  throw new Error('Credenciales de Supabase no configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

if (import.meta.env.DEV) {
  console.log('✅ Cliente de Supabase inicializado correctamente')
}
