import { AccountManagementModal } from "./accountManagementModal/AccountManagementModal";
import { CreateAccountModal } from "./createAccountModal/CreateAccountModal";
import { GroupCreationModal } from "./groupCreate/GroupCreationModal";
import { GroupMembersModal } from "./groupMembers/GroupMembersModal";
import { GroupSettingsModal } from "./groupSettings/GroupSettingsModal";
import { ListCreationModal } from "./listCreate/ListCreationModal";
import { LoginModal } from "./loginModal/LoginModal";

export const MODALS = {
    login: LoginModal,
    createAccount: CreateAccountModal,
    manageAccount: AccountManagementModal,
    createGroup: GroupCreationModal,
    createList: ListCreationModal,
    groupSettings: GroupSettingsModal,
    groupMembers: GroupMembersModal,
};
