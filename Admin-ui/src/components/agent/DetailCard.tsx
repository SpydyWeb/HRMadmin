
const DetailCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => {
return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex items-start gap-4">
        <div className="bg-green-100 rounded-lg p-5">{icon}</div>
        <div className="text-start">
          <p className="text-gray-500 text-lg mb-1">{label}</p>
          <p className="text-gray-900 font-semibold text-xl">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default DetailCard