import { User } from "../../types/auth";
import { GroupType } from "../../types/group";
import { ListType } from "../../types/list";
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

class UserApiMethods {
    constructor(
        private context: ApiContextType,
        private request: RequestFunction,
    ) {}

    public async self(): Promise<User | string> {
        const result = await this.request<User>("get", "/user");
        if (result.success) {
            return result.data;
        }
        return result.code;
    }

    public async updateSettings(
        newSettings: Partial<User>,
    ): Promise<User | string> {
        const result = await this.request<User>("post", "/user/settings", {
            body: newSettings,
        });
        if (result.success) {
            this.context.setUser(result.data);
            return result.data;
        }
        return result.code;
    }

    public async changePassword(fields: {
        current: string;
        new: string;
    }): Promise<User | string> {
        const result = await this.request<User>("post", "/user/password", {
            body: fields,
        });
        if (result.success) {
            this.context.setUser(result.data);
            return result.data;
        }
        return result.code;
    }

    public async searchUsers(query: string): Promise<User[]> {
        const result = await this.request<User[]>("get", "/user/search", {
            params: {
                q: query,
            },
        });
        if (result.success) {
            return result.data;
        }
        return [];
    }
}

class GroupApiMethods {
    constructor(
        private context: ApiContextType,
        private request: RequestFunction,
    ) {}

    public async create(data: {
        name: string;
        description: string;
        members: User[];
    }): Promise<GroupType | string> {
        const body = {
            name: data.name,
            desc: data.description,
            members: data.members.map((m) => m.id),
        };
        const result = await this.request<GroupType>("post", "/groups/", {
            body,
        });

        if (result.success) {
            return result.data;
        }
        return result.code;
    }

    public async get_groups(): Promise<GroupType[]> {
        const result = await this.request<GroupType[]>("get", "/groups/");
        if (result.success) {
            return result.data;
        } else {
            return [];
        }
    }

    public async get_group_users(id: string): Promise<User[]> {
        const result = await this.request<User[]>("get", `/groups/${id}/users`);
        if (result.success) {
            return result.data;
        } else {
            return [];
        }
    }

    public async get_group_lists(id: string): Promise<ListType[]> {
        const result = await this.request<ListType[]>(
            "get",
            `/groups/${id}/lists`,
        );
        if (result.success) {
            return result.data;
        } else {
            return [];
        }
    }
}

export class ApiMethods {
    public auth: AuthApiMethods;
    public user: UserApiMethods;
    public groups: GroupApiMethods;
    constructor(
        private context: ApiContextType,
        private request: RequestFunction,
    ) {
        this.auth = new AuthApiMethods(this.context, this.request);
        this.user = new UserApiMethods(this.context, this.request);
        this.groups = new GroupApiMethods(this.context, this.request);
    }
}
