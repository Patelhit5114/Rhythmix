import logo1 from "../images/logo_transparent.png";
import { Link } from "react-router-dom";
const Welcome = () => {
  return (
    <div className="bg-app-black  flex flex-col  justify-center items-center w-full h-full">
      <div className="logoDiv">
        <img
          src={logo1}
          alt="tuneup logo"
          width="205"
          className="flex items-center mb-10"
        />
      </div>
      {/* <div className="logoDiv bg-app-black">
  <img
    src={logo1}
    alt="tuneup logo"
    width="205"
    className="flex items-center mb-10"
  />
</div> */}
      <div className=" font-bold justify-center items-center text-5xl text-white mb-15">
        Welcome to Rhythmix
      </div>
      <div className="mt-20 text-2xl text-gray-400">
        <Link to="/Home">
          <button className="bg-gray-400 text-black rounded-full text-sm p-4 font-bold">
            Happy Listening !
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Welcome;
