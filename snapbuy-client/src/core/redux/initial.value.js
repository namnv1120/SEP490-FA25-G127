import { userlisadata } from "../json/users";
import { rolesandpermission } from "../json/rolesandpermissiondata";
import { deleteaccountdata } from "../json/deleteaccount";

const initialState = {
  userlist_data: userlisadata,
  rolesandpermission_data: rolesandpermission,
  deleteaccount_data: deleteaccountdata,
};

export default initialState;