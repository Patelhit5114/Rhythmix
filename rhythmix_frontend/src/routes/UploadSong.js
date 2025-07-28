import { useState } from "react";
import Tuneup_logo from "../images/logo_transparent.png";
import IconText from "../components/shared/Icontext";
import { Icon } from "@iconify/react";
import TextWithHover from "../components/shared/Textwithhover";
import TextInput from "../components/shared/Textinput";
// import { Cloudinary } from "@cloudinary/url-gen";
import CloudinaryUpload from "../components/shared/CloudinaryUpload";
import { makeAuthenticatedPOSTRequest } from "../utils/serverHelpers";
import { useNavigate } from "react-router-dom";

const UploadSong = ({ curActiveScreen }) => {
  const [
    // CreatePlaylistModalOpen,
    setCreatePlaylistModalOpen,
  ] = useState(false);
  // const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [UploadedSonFileName, setUploadedSonFileName] = useState();
  const navigate = useNavigate();

  const submitSong = async () => {
    console.log("Submitting song with data:", { name, thumbnail, track: playlistUrl });

    if (!name || !thumbnail || !playlistUrl) {
      alert("Please fill all fields and upload a track");
      return;
    }

    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token); // Debug log

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {
      const data = { name, thumbnail, track: playlistUrl };
      const rawResponse = await fetch("http://localhost:8080/song/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(data),
      });

      console.log("Response status:", rawResponse.status); // Debug log

      if (rawResponse.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const text = await rawResponse.text();
      console.log("Raw response text:", text); // Debug log

      let response;
      try {
        response = JSON.parse(text);
      } catch (err) {
        console.error("Invalid JSON returned from server:", text);
        alert("Server error. Try again.");
        return;
      }

      if (response.err) {
        alert("Could not create song: " + response.err);
        return;
      }

      alert("Success! Song uploaded");
      navigate("/home");
    } catch (error) {
      console.error("Error submitting song:", error);
      alert("Error uploading song");
    }
  };

  return (
    <div className="h-full w-full flex">
      {/* {this div will be the left panel} */}
      <div className="h-full w-1/5 bg-black flex flex-col justify-between">
        <div>
          {/* {this div is for logo} */}
          <div className="logoDiv">
            <img
              src={Tuneup_logo}
              alt="tuneup logo"
              width="185"
              className="ml-5 flex items-center"
            />
          </div>
          <div className="py-5">
            <IconText
              iconName={"ant-design:home-filled"}
              displayText={"Home"}
              targetLink={"/home"}
              active={curActiveScreen === "home"}
            />
            <IconText
              iconName={"tabler:search"}
              displayText={"Search"}
              active={curActiveScreen === "search"}
              targetLink={"/search"}
            />
            <IconText
              iconName={"tabler:books"}
              displayText={"Library"}
              active={curActiveScreen === "library"}
              targetLink={"/library"}
            />
            <IconText
              iconName={"ic:sharp-library-music"}
              displayText={"My Music"}
              targetLink={"/myMusic"}
              active={curActiveScreen === "myMusic"}
            />
          </div>

          <div className="pt-5">
            <IconText
              iconName={"fluent:add-square-20-filled"}
              displayText={"Create Playlist"}
              onClick={() => {
                setCreatePlaylistModalOpen(true);
              }}
            />
            <IconText
              iconName={"iconoir:heart-solid"}
              displayText={"Liked Songs"}
            />
          </div>
        </div>

        <div className="px-5 mb-10">
          <div className="border border-gray-100 text-white w-2/5 flex px-2 py-1 rounded full items-center justify-center hover:border-white cursor-pointer">
            <Icon icon="icon-park-outline:earth" />
            <div className="ml-2 text-sm font-semibold">English</div>
          </div>
        </div>
      </div>
      {/*This second div will be the right part(main content)*/}
      <div className="h-full w-4/5 bg-app-black overflow-auto">
        {/* {this second div will be the right panel} */}
        <div className="navbar w-full h-1/10 bg-black bg-opacity-30 flex items-end justify-end">
          <div className="w-1/2 flex h-full items-center">
            <div className="w-2/3 flex justify-around items-center">
              <TextWithHover displayText={"Premium"} />
              <TextWithHover displayText={"Support"} />
              <TextWithHover displayText={"Download"} />
            </div>
            <div className="h-1/2 border-r border-white "></div>

            <div className="w-1/3 flex justify-around h-full items-center">
              <TextWithHover displayText={"Upload song"} active />

              <div className="bg-white w-10 h-10 flex items-center justify-center rounded-full font-semibold cursor-pointer">
                HR
              </div>
            </div>
          </div>
        </div>
        <div className="content p-8 pt-0  overflow-auto">
          <div className="text-2xl font-semibold mb-5 text-white mt-8">
            Upload Your Music
          </div>
          <div className="w-2/3 flex space-x-3">
            <div className="w-1/2">
              <TextInput
                label="Name"
                labelClassName={"text-white"}
                placeholder="Name"
                value={name}
                setValue={setName}
              />
            </div>
            <div className="w-1/2">
              <TextInput
                label="Thumbnail"
                labelClassName={"text-white"}
                placeholder="Thumbnail"
                value={thumbnail}
                setValue={setThumbnail}
              />
            </div>
          </div>
          <div className="py-5">
            {UploadedSonFileName ? (
              <div className="bg-white rounded-full p-3 w-1/3">
                {UploadedSonFileName.substring(0, 35)}...
              </div>
            ) : (
              <CloudinaryUpload
                setUrl={setPlaylistUrl}
                setName={setUploadedSonFileName}
              />
            )}
          </div>
          <div
            className="bg-white w-40 flex items-center justify-center p-4 rounded-full cursor-pointer font-semibold"
            onClick={submitSong}
          >
            Submit song
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSong;
