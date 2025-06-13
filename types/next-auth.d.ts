// types/next-auth.d.ts
import { DefaultSession, DefaultUser, DefaultJWT } from "next-auth";

declare module "next-auth" {
    /**
     * Extends Session.user
     */
    interface Session {
        user: {
            /** Other custom fields goes here */
            id: string;
            name: string;
        } & DefaultSession["user"];
    }

    /**
     * Extend user return from CredentialsProvider
     */
    interface User extends DefaultUser {
        id: string;
        name: string;
    }

    /**
     * JWT Token Extension
     */
    interface JWT extends DefaultJWT {
        id: string;
        name: string;
    }
}
