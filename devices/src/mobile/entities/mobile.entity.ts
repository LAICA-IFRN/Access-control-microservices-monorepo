import { mobile } from "@prisma/client";

export class MobileEntity implements mobile {
    id: string;
    user_id: string;
    user_name: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}
