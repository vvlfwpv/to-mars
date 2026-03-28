import { UUID, Timestamp } from './database'

export type Group = {
  id: UUID
  name: string
  description?: string | null
  is_sample?: boolean
  is_read_only?: boolean
  created_at: Timestamp
}

export type GroupMember = {
  id: UUID
  group_id: UUID
  user_id: UUID
  created_at: Timestamp
}

export type GroupMemberWithEmail = GroupMember & {
  user_email: string
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
