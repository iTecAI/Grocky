import { useUser } from "../../util/api";
import { IndexLoggedOut } from "./LoggedOut";
import "./index.scss";

export function IndexView() {
    const [user] = useUser();
    return user ? <></> : <IndexLoggedOut />;
}
