export type Role = {
  id: number
  name: string
}

export type RoleEntity = {
  id: string;
  name: string;
  role_id: number;
  role: Role;
  active: boolean;
  user_id: string;
  created_by: string;
  created_at: Date;
}