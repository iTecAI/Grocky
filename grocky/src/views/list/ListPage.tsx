import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useApi, useUser, useReady, useSession } from "../../util/api";

export function ListPage() {
    const { listId } = useParams();
    const { lists } = useApi();
    const [user] = useUser();
    const ready = useReady();
    const session = useSession();
    const { t } = useTranslation();
    return <></>;
}
