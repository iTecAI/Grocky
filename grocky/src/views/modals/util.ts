import { AccountManagementModal } from "./accountManagementModal/AccountManagementModal";
import { CreateAccountModal } from "./createAccountModal/CreateAccountModal";
import { GroupCreationModal } from "./groupCreate/GroupCreationModal";
import { ListCreationModal } from "./listCreate/ListCreationModal";
import { LoginModal } from "./loginModal/LoginModal";

export const MODALS = {
    login: LoginModal,
    createAccount: CreateAccountModal,
    manageAccount: AccountManagementModal,
    createGroup: GroupCreationModal,
    createList: ListCreationModal,
};
