import { FC } from "react";
import { signOut } from "firebase/auth";
import { getAuth } from "firebase/auth";

export const Logout: FC = () => {
  const auth = getAuth();
  const onLogoutClick = () => {
    console.log("Logout");
    signOut(auth);
  };

  return <button onClick={onLogoutClick} className="coolButton redButton">Logout</button>;
};