import { AccountManagementModal } from "./accountManagementModal/AccountManagementModal";
import { CreateAccountModal } from "./createAccountModal/CreateAccountModal";
import { GroupCreationModal } from "./groupCreate/GroupCreationModal";
import { LoginModal } from "./loginModal/LoginModal";

export const MODALS = {
    login: LoginModal,
    createAccount: CreateAccountModal,
    manageAccount: AccountManagementModal,
    createGroup: GroupCreationModal,
};
