const Loading = ({ message = "Cargando..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export default Loading