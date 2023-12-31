import { User } from "../../types/auth";
import { GroupType } from "../../types/group";
import {
    GroceryItem,
    ListCreationModel,
    ListItem,
    ListType,
} from "../../types/list";
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

    public async get(id: string): Promise<User | null> {
        const result = await this.request<User>("get", `/user/${id}`);
        if (result.success) {
            return result.data;
        }
        return null;
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

    public async get_group(id: string): Promise<GroupType | null> {
        const result = await this.request<GroupType>("get", `/groups/${id}`);
        if (result.success) {
            return result.data;
        } else {
            return null;
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

    public async update_group_settings(
        id: string,
        settings: { name: string; description: string },
    ): Promise<GroupType | null> {
        const result = await this.request<GroupType>(
            "post",
            `/groups/${id}/settings`,
            { body: settings },
        );
        if (result.success) {
            return result.data;
        } else {
            return null;
        }
    }

    public async add_members(group: string, ids: string[]): Promise<User[]> {
        const result = await this.request<User[]>(
            "put",
            `/groups/${group}/members`,
            { body: ids },
        );
        if (result.success) {
            return result.data;
        } else {
            return [];
        }
    }

    public async change_owner(group: string, id: string): Promise<User[]> {
        const result = await this.request<User[]>(
            "post",
            `/groups/${group}/owner/${id}`,
        );
        if (result.success) {
            return result.data;
        } else {
            return [];
        }
    }
}

class ListApiMethods {
    constructor(
        private context: ApiContextType,
        private request: RequestFunction,
    ) {}

    public async create(
        name: string,
        description: string,
        type: "grocery" | "task" | "general",
        owner: { type: "user" | "group"; id: string },
        options?: any,
    ): Promise<ListType | string> {
        const result = await this.request<ListType>("post", "/lists", {
            body: {
                name,
                description,
                type,
                owner,
                options: options ?? {},
            },
        });

        if (result.success) {
            return result.data;
        }
        return result.code;
    }

    public async get_user_lists(): Promise<ListType[]> {
        const result = await this.request<ListType[]>("get", "/lists/for/user");

        if (result.success) {
            return result.data;
        }
        return [];
    }

    public async get_list_items(id: string): Promise<ListItem[]> {
        const result = await this.request<ListItem[]>(
            "get",
            `/lists/${id}/items`,
        );

        if (result.success) {
            return result.data;
        }
        return [];
    }

    public async get_list_by_id(id: string): Promise<ListType | null> {
        const result = await this.request<ListType>("get", `/lists/${id}`);

        if (result.success) {
            return result.data;
        }
        return null;
    }

    public async create_item(
        list: string,
        item: ListCreationModel,
    ): Promise<ListItem[]> {
        const result = await this.request<ListItem[]>(
            "post",
            `/lists/${list}/items/${item.type}`,
            { body: item },
        );
        if (result.success) {
            return result.data;
        }
        return [];
    }
}

class GroceryApiMethods {
    constructor(
        private context: ApiContextType,
        private request: RequestFunction,
    ) {}

    public async search(
        term: string,
        location: string,
        stores: string[],
    ): Promise<GroceryItem[]> {
        const result = await this.request<GroceryItem[]>(
            "get",
            "/groceries/search",
            {
                params: {
                    search: term,
                    location,
                    stores: stores.join(","),
                },
            },
        );
        if (result.success) {
            return result.data;
        }
        return [];
    }

    public async suggest(
        term: string,
        location: string,
        stores: string[],
    ): Promise<string[]> {
        const result = await this.request<string[]>("get", "/groceries/auto", {
            params: {
                search: term,
                location,
                stores: stores.join(","),
            },
        });
        if (result.success) {
            return result.data;
        }
        return [];
    }

    public async get_item(
        store: string,
        id: string,
    ): Promise<GroceryItem | null> {
        const result = await this.request<GroceryItem>(
            "get",
            `/groceries/items/${store}/${id}`,
        );

        if (result.success) {
            return result.data;
        }
        return null;
    }
}

export class ApiMethods {
    public auth: AuthApiMethods;
    public user: UserApiMethods;
    public groups: GroupApiMethods;
    public lists: ListApiMethods;
    public groceries: GroceryApiMethods;
    constructor(
        private context: ApiContextType,
        private request: RequestFunction,
    ) {
        this.auth = new AuthApiMethods(this.context, this.request);
        this.user = new UserApiMethods(this.context, this.request);
        this.groups = new GroupApiMethods(this.context, this.request);
        this.lists = new ListApiMethods(this.context, this.request);
        this.groceries = new GroceryApiMethods(this.context, this.request);
    }
}
