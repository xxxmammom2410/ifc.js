import { FC, FormEvent, useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export const MailLogin: FC = () => {
  const auth = getAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onLoginClick = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    signInWithEmailAndPassword(auth, email, password);
  };

  return (
      <form onSubmit={onLoginClick} className="contentFlexVertical">
        <label className="coolLabel">
          Email Address
          <input
            className="coolField"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="coolLabel">
          Password
          <input
            className="coolField"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      <button  className="coolButton orangeButton" type="submit">Email Login</button>
      </form>
  );
};
