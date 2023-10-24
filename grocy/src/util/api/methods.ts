import { Session } from "../../types/auth";
import { RequestFunction } from "./types";

class AuthApiMethods {
    constructor(
        private session: Session | null,
        private request: RequestFunction,
    ) {}
}

export class ApiMethods {
    public auth: AuthApiMethods;
    constructor(
        private session: Session | null,
        private request: RequestFunction,
    ) {
        this.auth = new AuthApiMethods(this.session, this.request);
    }
}
