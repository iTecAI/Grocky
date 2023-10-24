import { createContext } from "react";
import { Session } from "../../types/auth";

export type ApiResponse<T> =
    | {
          success: true;
          data: T;
      }
    | {
          success: false;
          status: number;
          code: string;
          data?: any;
      };

export type RequestFunction = <T>(
    method: "get" | "post" | "put" | "delete",
    url: string,
    options?: { params?: { [key: string]: any }; body?: any },
) => Promise<ApiResponse<T>>;

export type ApiContextType = {
    session: Session | null;
    request: RequestFunction;
};

export const ApiContext = createContext<ApiContextType>({
    session: null,
    request: async () => ({
        success: false,
        status: 0,
        code: "internal.notInitialized",
    }),
});
