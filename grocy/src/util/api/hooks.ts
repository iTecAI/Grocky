import { useContext, useMemo } from "react";
import { Session, User } from "../../types/auth";
import { ApiContext, RequestFunction } from "./types";
import { ApiMethods } from "./methods";

export function useSession(): Session | null {
    const { session } = useContext(ApiContext);
    return session;
}

export function useRequest(): RequestFunction {
    const { request } = useContext(ApiContext);
    return request;
}

export function useApi(): ApiMethods {
    const context = useContext(ApiContext);

    const methods = useMemo(
        () => new ApiMethods(context, context.request),
        [context.session, context.request, context.user, context.ready],
    );
    return methods;
}

export function useUser(): [User | null, (user: User | null) => void] {
    const { user, setUser } = useContext(ApiContext);
    return [user, setUser];
}

export function useReady(): boolean {
    return useContext(ApiContext).ready;
}

export function useStorage(): {
    set: (scope: string, id: string, data: string) => Promise<string>;
    get: (scope: string, id: string) => Promise<string>;
    delete: (scope: string, id: string) => Promise<null>;
} {
    const request = useRequest();

    return {
        set: async (scope: string, id: string, data: string) => {
            const response = await request<{ path: string }>(
                "post",
                `/storage/${scope}/${id}`,
                {
                    body: {
                        data_url: data,
                        additional_tags: {},
                        restrict: {},
                    },
                },
            );

            if (response.success) {
                return response.data.path;
            } else {
                throw Error(response.code);
            }
        },
        get: async (scope, id) => {
            const response = await fetch(`/api/storage/${scope}/${id}`);
            if (response.ok && response.body) {
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            } else {
                throw Error(response.status.toString());
            }
        },
        delete: async (scope, id) => {
            const response = await request<{ path: string }>(
                "delete",
                `/storage/${scope}/${id}`,
            );

            if (response.success) {
                return null;
            } else {
                throw Error(response.code);
            }
        },
    };
}
