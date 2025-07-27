// import Tuneup_logo from "../images/logo1.png";
// import { Howl, Howler } from "howler";
// import IconText from "../components/shared/Icontext";
// import { Icon } from "@iconify/react";
import SingleSongCard from "../components/shared/SingleSongCard";
// import TextWithHover from "../components/shared/Textwithhover";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";
import { useState, useEffect } from "react";
import LoggedInContainer from "../containers/LoggedInContainers";

const Mymusic = () => {
  const [songData, setSongData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const response = await makeAuthenticatedGETRequest("/song/get/mysongs");
      // setSongData(response.data);
      setSongData(response.data);
    };
    getData();
  }, []);

  return (
    <LoggedInContainer curActiveScreen="myMusic">
      <div className="text-white text-xl  font-semibold pb-4 pl-2 pt-8">
        My Songs
      </div>
      <div className="space-y-3 overflow-auto">
        {songData.map((item,key = Date.now()) => {
          return <SingleSongCard info={item} playSound={() => {}} />;
        })}
      </div>
    </LoggedInContainer>
  );
};

export default Mymusic;
