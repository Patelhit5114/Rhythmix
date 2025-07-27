// in the route folder all /,/login,/signup,etc. all components are defined.
// create a login component
import icon from "../images/logo_transparent.png";
import TextInput from "../components/shared/Textinput";
import Passwordinput from "../components/shared/Passwordinput";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { makeUnauthenticatedPOSTRequest } from "../utils/serverHelpers";

const SignupComponent = () => {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cookie, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  const signUp = async () => {
    if (email !== confirmEmail) {
      alert("Email and confirm emails must match.Please check again");
      return;
    }
    const data = { email, password, username, firstName, lastName };
    // console.log(data);
    const response = await makeUnauthenticatedPOSTRequest(
      "/auth/register",
      data
    );

    if (response && !response.err) {
      // console.log(response);
      const token = response.token;
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
        <img src={icon} alt="TuneUp logo" width="175" />
      </div>
      <div className="inputRegion w-1/4 py-10 flex item-center justify-center flex-col">
        <div className="font-extrabold mb-4 text-xl flex justify-center">
          Sign up for free to start listening
        </div>
        <TextInput
          label="Email address"
          placeholder="Enter Email "
          className="my-6"
          value={email}
          setValue={setEmail}
        />

        <TextInput
          label="Confirm Email address "
          placeholder="Enter your email again "
          className="mb-6"
          value={confirmEmail}
          setValue={setConfirmEmail}
        />

        <TextInput
          label="Username"
          placeholder="Enter your username "
          className="mb-6"
          value={username}
          setValue={setUsername}
        />

        <Passwordinput
          label="Create Password"
          placeholder="Enter a strong Password here"
          value={password}
          setValue={setPassword}
        />
        <div className="w-full flex justify-center items-center space-x-4">
          <TextInput
            label="First Name"
            placeholder="Enter Your First name"
            className="my-6"
            value={firstName}
            setValue={setFirstName}
          />
          <TextInput
            label="Last Name"
            placeholder="Enter Your Last name"
            className="my-6"
            value={lastName}
            setValue={setLastName}
          />
        </div>
        <div className="w-full flex items-center justify-center my-8 ">
          <button
            className="bg-green-400 font-semibold p-3 px-10 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              signUp();
            }}
          >
            Sign up
          </button>
        </div>
        <div className="w-full border border-solid border-gray-400"></div>
        <div className="my-6 font-bold text-lg flex items-center justify-center">
          Already have an account?
        </div>
        <div className="flex justify-center border border-gray-500 text-gray-500 w-full items-center py-4 rounded-full font-bold">
          <Link to="/login"> LOG IN INSTEAD</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupComponent;
