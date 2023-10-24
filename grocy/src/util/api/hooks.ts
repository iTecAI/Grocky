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
