import { FC } from "react";
import { getApp } from "firebase/app";
import "./App.css";
import { Main } from "./components/main";

export const App: FC = () => {
  return (
    <div className="App">
      <Main />
    </div>
  );
};