// EditSwitch.tsx
interface EditSwitchProps {
  isEdit: boolean
  setIsEdit: (val: boolean) => void
}

const EditSwitch = ({ isEdit, setIsEdit }: EditSwitchProps) => {
  return (
    <div className="flex items-center gap-3">
      <span className="font-medium text-gray-700">Edit</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isEdit}
          onChange={() => setIsEdit(!isEdit)}
        />
        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-500 transition-all duration-300"></div>
        <div
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isEdit ? 'translate-x-6' : ''
          }`}
        ></div>
      </label>
      <span className="font-medium text-gray-700">{isEdit ? 'On' : 'Off'}</span>
    </div>
  )
}

export default EditSwitch
