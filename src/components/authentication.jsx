import React from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const Authetication = () => {
  return (
    <>
    <GoogleOAuthProvider clientId="717963751372-rj20has3ni4ismq2ufk7ob6n9rnh4iti.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                var decoded = jwt_decode(credentialResponse.credential);
               // handleSetUser(decoded);
                console.log(decoded);
              }}
              onError={() => {
                console.log("Login Failed");
              }}
            />
          </GoogleOAuthProvider>
    </>
  )
}

export default Authetication