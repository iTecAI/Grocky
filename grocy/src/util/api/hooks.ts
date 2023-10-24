import { useContext, useMemo } from "react";
import { Session } from "../../types/auth";
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
    const session = useSession();
    const request = useRequest();

    const methods = useMemo(
        () => new ApiMethods(session, request),
        [session, request],
    );
    return methods;
}
