import { FC } from "react";
import { getApp } from "firebase/app";
import "./App.css";
import { Main } from "./components/main";
import { UserProvider } from "./user-provider";

export const App: FC = () => {
  return (
    <div className="App">
      <UserProvider>
        <Main />
      </UserProvider>
    </div>
  );
};
