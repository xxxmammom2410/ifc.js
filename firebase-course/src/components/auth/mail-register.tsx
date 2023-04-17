import { FC, FormEvent, useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useUserContext } from "../../user-provider";

export const MailRegister: FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");

  const auth = getAuth();
  const [user, setUser] = useUserContext();

  const onRegister = async (ev: FormEvent<HTMLFormElement>) => {
    // イベントのデフォルト挙動を止める
    ev.preventDefault();
    // イベントの伝播を止める
    ev.stopPropagation();

    // メールとパスワードでユーザーを作成
    await createUserWithEmailAndPassword(auth, email, password).then(
      // 返却されるユーザー情報を使って、ユーザー名を更新
      (response) => {
        const newUser = response.user;
        updateProfile(newUser, { displayName: name }).then(() => {
          // ユーザー名を更新したら、contextのユーザー情報を更新
          setUser(newUser);
        });
      }
    );
    console.log("Register");
  };

  return (
    <form onSubmit={onRegister} className="contentFlexVertical">
      <label className="coolLabel">
        Full Name
        <input
          className="coolField"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="coolLabel">
        Email
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
        ></input>
      </label>
      <button className="coolButton orangeButton" type="submit">
        Register
      </button>
    </form>
  );
};
