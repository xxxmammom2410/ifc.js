import { FC } from "react";
import { getApp } from "firebase/app";
import "./App.css";

export const App: FC = () => {
  return (
    <div className="App">
      {JSON.stringify(getApp())}
    </div>
  );
};