// in the route folder all /,/login,/signup,etc. all components are defined.
//create a login component
import icon from "../images/logo_transparent.png";
import TextInput from "../components/shared/Textinput";
import Passwordinput from "../components/shared/Passwordinput";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { makeUnauthenticatedPOSTRequest } from "../utils/serverHelpers";
import { useCookies } from "react-cookie";

const LoginComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cookie, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  const login = async () => {
    const data = { email, password };
    // console.log(data);
    const response = await makeUnauthenticatedPOSTRequest("/auth/login", data);

    if (response && !response.err) {
      // console.log(response);
      const token = response.token;
      localStorage.setItem("token", token);
      const date = new Date();
      date.setDate(date.getDate() + 30);
      setCookie("token", token, { path: "/", expires: date });
      alert("success");
      navigate("/home");
    } else {
      alert("failure");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="logo p-4 border-b border-solid border-gray-400 w-full flex justify-center">
        <img src={icon} alt="Rhythmix logo" width="175" />
      </div>
      <div className="inputRegion w-1/4 py-10 flex item-center justify-center flex-col">
        <div className="font-extrabold mb-4 text-xl flex justify-center">
          To continue , log in to Rhythmix
        </div>
        <TextInput
          label="Email address or Username"
          placeholder="Email address or Username"
          className="my-6"
          value={email}
          setValue={setEmail}
        />

        <Passwordinput
          label="Password"
          placeholder="Password"
          value={password}
          setValue={setPassword}
        />
        <div className="w-full flex items-center justify-end my-8 ">
          <button
            className="bg-green-400 font-semibold p-3 px-10 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              login();
            }}
          >
            LOG IN
          </button>
        </div>
        <div className="w-full border border-solid border-gray-400"></div>
        <div className="my-6 font-bold text-lg flex items-center justify-center">
          Don't have an account?
        </div>
        <div className="flex justify-center border border-gray-500 text-gray-500 w-full items-center py-4 rounded-full font-bold">
          <Link to="/signup">SIGN UP FOR RHYTHMIX</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
