import { role, user_role } from "@prisma/client";

export type userFieldsToSelect = {
  id: string;
  name: string;
  active: boolean;
  document_type_id: number;
  created_at: Date;
  updated_at: Date;
};

export type findAllFilterDto = {
  name?: string;
  status?: boolean;
};

export type UserRoles = user_role & { role: role }
