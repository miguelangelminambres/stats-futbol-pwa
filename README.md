# ⚽ App Stats Fútbol - Frontend

Aplicación SaaS para control de estadísticas de partidos de fútbol.

## 🚀 INSTALACIÓN RÁPIDA

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
1. Copia `.env.example` como `.env`
2. Ve a [supabase.com](https://supabase.com) → Tu proyecto → Settings → API
3. Copia tu URL y anon key al archivo `.env`

### 3. Iniciar la aplicación
```bash
npm run dev
```

La app se abrirá en `http://localhost:3000`

## ✅ CREAR USUARIO DE PRUEBA

Para poder hacer login:

1. Ve a Supabase → Authentication → Users
2. Click en "Add user" → "Create new user"
3. Email: `test@test.com`
4. Password: `test123456`
5. Click en "Create user"

Ahora puedes hacer login con esas credenciales.

## 📦 SCRIPTS

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview de producción

## 📁 ESTRUCTURA

```
src/
├── components/      # Componentes reutilizables
├── contexts/        # Contextos (Auth, License)
├── lib/             # Utilidades (Supabase client)
├── pages/           # Páginas de la app
├── App.jsx          # Componente principal
├── main.jsx         # Punto de entrada
└── index.css        # Estilos globales
```

## 🔧 TECNOLOGÍAS

- React 18
- Vite
- Tailwind CSS
- Supabase
- React Router
- Lucide Icons

## 📝 NOTAS

- Esta es la **FASE 2** del proyecto
- Las próximas fases incluirán: gestión de jugadores, partidos y estadísticas completas
- Para más información, consulta la documentación en la carpeta raíz

---

**Desarrollado con ❤️ para gestionar equipos de fútbol**
