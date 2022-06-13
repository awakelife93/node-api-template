import { signIn, signOut } from "@/controllers/auth";
import { RouteItemType } from "@/lib/routes/items";

const rootPath = "/auth";
const AuthRoute: RouteItemType[] = [
  {
    path: `${rootPath}/signIn`,
    method: "post",
    next: signIn,
  },
  {
    path: `${rootPath}/signOut`,
    method: "post",
    next: signOut,
  },
];

export default AuthRoute;
