import { ReactNode, useCallback, useEffect, useState } from "react";
import { Session, User } from "../../types/auth";
import { ApiContext, ApiResponse } from "./types";

export function ApiProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState<boolean>(false);

    useEffect(() => {
        fetch("/api/auth/session", {
            method: "GET",
            headers: localStorage.getItem("token")
                ? {
                      Authorization: localStorage.getItem("token") as string,
                  }
                : undefined,
        }).then((result) => {
            if (result.status === 200) {
                result
                    .json()
                    .then((data) => {
                        setSession(data);
                        localStorage.setItem("token", data.id);
                        if (data.user) {
                            setUser(data.user);
                        }
                        setReady(true);
                    })
                    .catch((reason) =>
                        console.error("JSON parse error: ", reason),
                    );
            } else {
                console.error("Failed to retrieve session.");
            }
        });
    }, []);

    const request = useCallback(
        async function <T>(
            method: "get" | "post" | "put" | "delete",
            url: string,
            options?: { params?: { [key: string]: any }; body?: any },
        ): Promise<ApiResponse<T>> {
            let result: Response;
            try {
                result = await fetch(
                    "/api" +
                        url +
                        (options?.params
                            ? `?${new URLSearchParams(options.params)}`
                            : ""),
                    {
                        method,
                        headers: session
                            ? { Authorization: session.id }
                            : undefined,
                        body: options?.body
                            ? JSON.stringify(options.body)
                            : undefined,
                    },
                );
            } catch (e) {
                return {
                    success: false,
                    status: 0,
                    code: "internal.fetchError",
                };
            }

            if (result.ok) {
                const textData = await result.text();
                try {
                    return {
                        success: true,
                        data: JSON.parse(textData),
                    };
                } catch (e) {
                    return {
                        success: true,
                        data: textData as T,
                    };
                }
            } else {
                const textData = await result.text();
                try {
                    const parsedError = JSON.parse(textData);
                    return {
                        success: false,
                        status: result.status,
                        code: parsedError.code,
                        data: parsedError.data ?? null,
                    };
                } catch (e) {
                    return {
                        success: false,
                        status: result.status,
                        code: "error.unspecified",
                        data: textData,
                    };
                }
            }
        },
        [session],
    );

    return (
        <ApiContext.Provider value={{ session, request, user, setUser, ready }}>
            {children}
        </ApiContext.Provider>
    );
}
