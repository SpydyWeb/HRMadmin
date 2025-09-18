import { useLoaderData } from '@tanstack/react-router'
import Agent from '@/components/agent'
import { agentService } from '@/services/agentService'
import { useEffect } from 'react'

const ProfileDetails = () => {


  return (
    <div className='px-8'>
    <Agent/>
    </div>
  )
}

export default ProfileDetails;
