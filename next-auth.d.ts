import "next-auth";
import "next-auth/jwt";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isActive: boolean;
      companyId: number;
      companyName: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    isActive?: boolean;
    companyId?: number;
    companyName?: string;
  }
}
