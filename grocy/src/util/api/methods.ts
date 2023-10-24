import { User } from "../../types/auth";
import { RequestFunction, ApiContextType } from "./types";

class AuthApiMethods {
    constructor(
        private context: ApiContextType,
        private request: RequestFunction,
    ) {}

    public async createAccount(
        username: string,
        password: string,
    ): Promise<User | string> {
        const result = await this.request<User>("post", "/auth/user/create", {
            body: {
                username,
                password,
            },
        });
        if (result.success) {
            this.context.setUser(result.data);
            return result.data;
        } else {
            return result.code;
        }
    }

    public async login(
        username: string,
        password: string,
    ): Promise<User | string> {
        const result = await this.request<User>("post", "/auth/login", {
            body: {
                username,
                password,
            },
        });
        if (result.success) {
            this.context.setUser(result.data);
            return result.data;
        } else {
            return result.code;
        }
    }

    public async logout(): Promise<null> {
        if (!this.context.user) {
            return null;
        }

        await this.request("delete", "/auth/login");
        this.context.setUser(null);
        return null;
    }
}

export class ApiMethods {
    public auth: AuthApiMethods;
    constructor(
        private context: ApiContextType,
        private request: RequestFunction,
    ) {
        this.auth = new AuthApiMethods(this.context, this.request);
    }
}
