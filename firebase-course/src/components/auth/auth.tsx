import { FC } from "react";
import { GoogleAuth } from "./google-auth";
import { MailRegister } from "./mail-register";
import { MailLogin } from "./mail-login";
export const Auth: FC = () => {
  return (
    <div className="contentGrid">
      <div>
        <GoogleAuth />
      </div>
      <div>
        <MailRegister />
      </div>
      <MailLogin/>
    </div>
  );
};
