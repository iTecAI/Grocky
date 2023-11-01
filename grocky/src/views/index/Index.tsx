import { useUser } from "../../util/api";
import { IndexLoggedIn } from "./LoggedIn";
import { IndexLoggedOut } from "./LoggedOut";
import "./index.scss";

export function IndexView() {
    const [user] = useUser();
    return user ? <IndexLoggedIn /> : <IndexLoggedOut />;
}
