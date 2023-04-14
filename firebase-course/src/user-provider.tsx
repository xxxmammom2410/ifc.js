import { User } from "firebase/auth";
import { createContext,useState, FC,useContext, PropsWithChildren } from "react";


//contextオブジェクトをデフォルト値を持つ配列として定義 
export const userContext = createContext<
  [User | null, (user: User | null) => void]
>([null, () => {}]);


// contextのプロバイダーを作成
export const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  // ステートはUser,nullをとる
  const [user, setUser] = useState<User | null>(null);

  return (
    <userContext.Provider value={[user, setUser]}>
      {children}
    </userContext.Provider>
  );
};


// userContextを使うためのラッパー関数を公開
export const useUserContext = () => {
  return useContext(userContext);
};

