import { UUID, Timestamp } from './database'

export type Group = {
  id: UUID
  name: string
  created_at: Timestamp
}

export type GroupMember = {
  id: UUID
  group_id: UUID
  user_id: UUID
  created_at: Timestamp
}

export type GroupWithMembers = Group & {
  members: GroupMember[]
}

export type CreateGroupInput = {
  name: string
}

export type UpdateGroupInput = {
  name: string
}
