


export default function Header() {
  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between fixed top-0 left-0 right-0 z-10 px-8 border-b border-gray-200">
      <nav className="flex flex-row justify-between w-full items-center">
        <div className="flex flex-row gap-2 items-center max-w-[17rem]">
          <div className="bg-orange-400 w-12 h-12 font-bold text-white flex items-center justify-center rounded">
            HM
          </div>
          <span className="text-xl font-bold">Hierarchy Management</span>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <div>
            {/* <Notification />           */}
          </div>
          <div>
            {/* <CommonButton
              label="Manish"
              startIcon={<Avatar className='!w-6 !h-6' />}
              onClick={() => alert('Profile clicked')}
              color="primary"
            /> */}
          </div>
          <div>
            {/* <CommonButton
              label="Reset Password"
              startIcon={<IoMdLock className='!w-6 !h-6' />}
              onClick={() => alert('Reset Password clicked')}
              color="info"
            /> */}
          </div>
        </div>
      </nav>
    </header>
  )
}
