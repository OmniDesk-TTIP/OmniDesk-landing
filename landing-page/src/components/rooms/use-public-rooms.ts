import { useEffect, useState } from 'react'
import { getPublicRooms } from '../../services/rooms-api.ts'
import { toRoom, type Room } from './rooms-data.ts'

export type RoomsState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; rooms: Room[] }

export function usePublicRooms() {
  const [state, setState] = useState<RoomsState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    void getPublicRooms(controller.signal).then((rooms) => {
      if (controller.signal.aborted) return
      setState(rooms ? { status: 'ready', rooms: rooms.map(toRoom) } : { status: 'error' })
    })

    return () => controller.abort()
  }, [])

  return state
}
