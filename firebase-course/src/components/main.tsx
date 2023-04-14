import { FC } from "react";
import { Auth } from "./auth/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useUserContext } from "../user-provider";
import { useEffect } from "react";
import { User } from "./user/user";

export const Main: FC = () => {
  const auth = getAuth();
  const [user, setUser] = useUserContext();

  useEffect(() => {
    // ユーザーがログインしているかどうかを監視する
    onAuthStateChanged(auth, (user) => {
      // ユーザーがログインしている場合はuserにユーザー情報が入る
      if (user) {
        setUser(user);
        // ユーザーがログインしていない場合はuserにnullが入る
      } else {
        setUser(null);
      }
    });
  }, []);

  return (
    <div className="centerContainer">
      {Boolean(user) ? <User /> : <Auth />}
      </div>
  );
};
