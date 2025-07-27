import Tuneup_logo from "../images/logo_transparent.png";
import IconText from "../components/shared/Icontext";
import { Icon } from "@iconify/react";
// import { Children, useContext, useEffect, useState } from "react";
import { useContext, useState, useLayoutEffect, useRef } from "react";
import { Howl} from "howler";
// import {Howler} from "howler";
import TextWithHover from "../components/shared/Textwithhover";
import songContext from "../contexts/songContext";
import CreatePlaylistModal from "../modals/CreatePlaylistModal";
import AddToPlaylistModal from "../modals/AddToPlaylistModal";
import { makeAuthenticatedPOSTRequest, makeAuthenticatedLogoutRequest } from "../utils/serverHelpers";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const LoggedInContainer = ({ children, curActiveScreen }) => {
  const [CreatePlaylistModalOpen, setCreatePlaylistModalOpen] = useState(false);
  const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
  const {
    currentSong,
    // setCurrentSong,
    soundPlayed,
    setSoundPlayed,
    isPaused,
    setIsPaused,
  } = useContext(songContext);

  const [cookie, setCookie, removeCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  const firstUpdate = useRef(true);

// OLD CODE
  // useLayoutEffect(() => {
  //   //the folowing if statement will prevent the useEffect from running on the first render
  //   if (firstUpdate.current) {
  //     firstUpdate.current = false;
  //     return;
  //   }
  //   if (!currentSong && currentSong.track) {
  //     return;
  //   }
  //   // console.log("here");
  //   changeSong(currentSong.track);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currentSong]);

  useLayoutEffect(() => {
    //the folowing if statement will prevent the useEffect from running on the first render
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    if (!currentSong || !currentSong.track) {
      return;
    }
    // console.log("here");
    changeSong(currentSong.track);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]);

  const addSongToPlaylist = async (playlistId) => {
    const songId = currentSong._id;

    const payload = { playlistId, songId };
    const response = await makeAuthenticatedPOSTRequest(
      "/playlist/add/song",
      payload
    );
    if (response._id) {
      setAddToPlaylistModalOpen(false);
    }
  };

  const playSound = () => {
    if (!soundPlayed) {
      return;
    }
    soundPlayed.play();
  };

  const changeSong = (songSrc) => {
    if (soundPlayed) {
      soundPlayed.stop();
    }
    let sound = new Howl({
      src: [songSrc],
      html5: true,
    });
    setSoundPlayed(sound);
    sound.play();
    setIsPaused(false);
  };

  const pauseSound = () => {
    soundPlayed.pause();
  };

  const togglePlayPause = () => {
    if (isPaused) {
      playSound();
      setIsPaused(false);
    } else {
      pauseSound();
      setIsPaused(true);
    }
  };

  const logout = async () => {
    try {
      await makeAuthenticatedLogoutRequest();
      removeCookie("token", { path: "/" });
      navigate("/login");
    } catch (error) {
      // Even if server request fails, remove token locally
      removeCookie("token", { path: "/" });
      navigate("/login");
    }
  };

  // const playNextSong = async()=>{
  //   const response = await fetch(`/api/nextSong/${currentSong._id}`);
  //   const nextSong = await response.json();

  //   // Change the current song to the next song
  //   setCurrentSong(nextSong);

  //   // Play the next song
  //   changeSong(nextSong.track);
  // }

  return (
    <div className="h-full w-full bg-app-black">
      {CreatePlaylistModalOpen && (
        <CreatePlaylistModal
          closeModal={() => {
            setCreatePlaylistModalOpen(false);
          }}
        />
      )}
      {addToPlaylistModalOpen && (
        <AddToPlaylistModal
          addSongToPlaylist={addSongToPlaylist}
          closeModal={() => {
            setAddToPlaylistModalOpen(false);
          }}
        />
      )}
      <div className={`${currentSong ? "h-9/10" : "h-full"} w-full flex`}>
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
                // active={curActiveScreen==="myMusic"}
              />
              <IconText
                iconName={"iconoir:heart-solid"}
                displayText={"Liked Songs"}
                // active={curActiveScreen==="myMusic"}
              />

              {/* <IconText
                iconName={"iconoir:heart-solid"}
                displayText={"Upload Song"}
                targetLink={"/uploadSong"}

                active={curActiveScreen==="uploadSong"}
              /> */}
            </div>
          </div>

          <div className="px-5 mb-10">
            <div className="border border-gray-100 text-white w-2/5 flex px-2 py-1 rounded full items-center justify-center hover:border-white cursor-pointer">
              <Icon icon="icon-park-outline:earth" />
              <div className="ml-2 text-sm font-semibold">English</div>
            </div>
          </div>
        </div>
        <div className="h-full w-4/5 bg-app-black overflow-auto">
          {/* {this second div will be the right panel} */}
          <div className="navbar w-full h-1/10 bg-black bg-opacity-30 flex items-end justify-end">
            <div className="w-1/2 flex h-full items-center">
              <div className="w-2/3 flex justify-center items-center space-x-6">
                <TextWithHover displayText={"Premium"} />
                <TextWithHover displayText={"Support"} />
                <TextWithHover displayText={"Download"} />
              </div>
              <div className="h-1/2 border-r border-white mx-4"></div>

              <div className="w-1/3 flex justify-center items-center space-x-6 h-full">
                <Link to="/uploadSong">
                  <TextWithHover displayText={"Upload song"} />
                </Link>
                <TextWithHover displayText={"Logout"} onClick={logout} />
                <div className="bg-white w-10 h-10 flex items-center justify-center rounded-full font-semibold cursor-pointer">
                  HD
                </div>
              </div>
            </div>
          </div>
          <div className="content p-8 pt-0  overflow-auto">{children}</div>
        </div>
      </div>

      {/* {This div is for current playing song} */}
      {currentSong && (
        <div className="w-full h-1/10 bg-black bg-opacity-30 text-white flex items-center px-4">
          <div className="w-1/3 flex items-center">
            <img
              src={currentSong.thumbnail}
              alt="currenSongThumbnail"
              className="h-14 w-14 rounded"
            />
            <div className="pl-4">
              <div className="text-sm hover:underline cursor-pointer">
                {currentSong.name}
              </div>
              <div className="text-xs text-gray-500 hover:line cursor-pointer">
                {currentSong.artist.firstName +
                  " " +
                  currentSong.artist.lastName}
              </div>
            </div>
          </div>
          <div className="w-1/2 flex justify-center  h-full flex-col items-center">
            <div className="flex w-1/3 justify-between items-center">
              {/* controls for the playing song go here */}
              <Icon
                icon="ph:shuffle-fill"
                fontSize={30}
                className="cursor-pointer text-gray-500 hover:text-white"
              />
              <Icon
                icon="ic:twotone-skip-previous"
                fontSize={30}
                className="cursor-pointer text-gray-500 hover:text-white"
              />
              <Icon
                icon={isPaused ? "gridicons:play" : "gridicons:pause"}
                fontSize={50}
                className="cursor-pointer text-gray-500 hover:text-white"
                onClick={togglePlayPause}
              />
              <Icon
                icon="ic:twotone-skip-next"
                fontSize={30}
                className="cursor-pointer text-gray-500 hover:text-white"
                // onClick={playNextSong}
              />
              <Icon
                icon="carbon:repeat"
                fontSize={30}
                className="cursor-pointer text-gray-500 hover:text-white"
              />
            </div>
            {/* <div>Progress Bar Here</div> */}
          </div>
          <div className="w-1/3 flex justify-end pr-4 space-x-4 items-center">
            <Icon
              icon="ic:twotone-playlist-add"
              fontSize={30}
              className="cursor-pointer text-gray-500 hover:text-white"
              onClick={() => {
                setAddToPlaylistModalOpen(true);
              }}
            />
            <Icon
              icon="mdi:heart-outline"
              fontSize={25}
              className="cursor-pointer text-gray-500 hover:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggedInContainer;

// import Tuneup_logo from "../images/logo_transparent.png";
// import IconText from "../components/shared/Icontext";
// import { Icon } from "@iconify/react";
// // import { Children, useContext, useEffect, useState } from "react";
// import { useContext, useState, useLayoutEffect, useRef } from "react";
// import { Howl} from "howler";
// // import {Howler} from "howler";
// import TextWithHover from "../components/shared/Textwithhover";
// import songContext from "../contexts/songContext";
// import CreatePlaylistModal from "../modals/CreatePlaylistModal";
// import AddToPlaylistModal from "../modals/AddToPlaylistModal";
// import { makeAuthenticatedPOSTRequest, makeAuthenticatedLogoutRequest } from "../utils/serverHelpers";
// import { useCookies } from "react-cookie";
// import { useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";

// const LoggedInContainer = ({ children, curActiveScreen }) => {
//   const [CreatePlaylistModalOpen, setCreatePlaylistModalOpen] = useState(false);
//   const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
//   const {
//     currentSong,
//     // setCurrentSong,
//     soundPlayed,
//     setSoundPlayed,
//     isPaused,
//     setIsPaused,
//   } = useContext(songContext);

//   const [cookie, setCookie, removeCookie] = useCookies(["token"]);
//   const navigate = useNavigate();

//   const firstUpdate = useRef(true);

//   useLayoutEffect(() => {
//     //the folowing if statement will prevent the useEffect from running on the first render
//     if (firstUpdate.current) {
//       firstUpdate.current = false;
//       return;
//     }
//     if (!currentSong && currentSong.track) {
//       return;
//     }
//     // console.log("here");
//     changeSong(currentSong.track);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentSong]);

//   const addSongToPlaylist = async (playlistId) => {
//     const songId = currentSong._id;

//     const payload = { playlistId, songId };
//     const response = await makeAuthenticatedPOSTRequest(
//       "/playlist/add/song",
//       payload
//     );
//     if (response._id) {
//       setAddToPlaylistModalOpen(false);
//     }
//   };

//   const playSound = () => {
//     if (!soundPlayed) {
//       return;
//     }
//     soundPlayed.play();
//   };

//   const changeSong = (songSrc) => {
//     if (soundPlayed) {
//       soundPlayed.stop();
//     }
//     let sound = new Howl({
//       src: [songSrc],
//       html5: true,
//     });
//     setSoundPlayed(sound);
//     sound.play();
//     setIsPaused(false);
//   };

//   const pauseSound = () => {
//     soundPlayed.pause();
//   };

//   const togglePlayPause = () => {
//     if (isPaused) {
//       playSound();
//       setIsPaused(false);
//     } else {
//       pauseSound();
//       setIsPaused(true);
//     }
//   };

//   const logout = async () => {
//     try {
//       await makeAuthenticatedLogoutRequest();
//       removeCookie("token", { path: "/" });
//       navigate("/login");
//     } catch (error) {
//       // Even if server request fails, remove token locally
//       removeCookie("token", { path: "/" });
//       navigate("/login");
//     }
//   };

//   // const playNextSong = async()=>{
//   //   const response = await fetch(`/api/nextSong/${currentSong._id}`);
//   //   const nextSong = await response.json();

//   //   // Change the current song to the next song
//   //   setCurrentSong(nextSong);

//   //   // Play the next song
//   //   changeSong(nextSong.track);
//   // }

//   return (
//     <div className="h-full w-full bg-app-black">
//       {CreatePlaylistModalOpen && (
//         <CreatePlaylistModal
//           closeModal={() => {
//             setCreatePlaylistModalOpen(false);
//           }}
//         />
//       )}
//       {addToPlaylistModalOpen && (
//         <AddToPlaylistModal
//           addSongToPlaylist={addSongToPlaylist}
//           closeModal={() => {
//             setAddToPlaylistModalOpen(false);
//           }}
//         />
//       )}
//       <div className={`${currentSong ? "h-9/10" : "h-full"} w-full flex`}>
//         {/* {this div will be the left panel} */}
//         <div className="h-full w-1/5 bg-black flex flex-col justify-between">
//           <div>
//             {/* {this div is for logo} */}
//             <div className="logoDiv">
//               <img
//                 src={Tuneup_logo}
//                 alt="tuneup logo"
//                 width="185"
//                 className="ml-5 flex items-center"
//               />
//             </div>
//             <div className="py-5">
//               <IconText
//                 iconName={"ant-design:home-filled"}
//                 displayText={"Home"}
//                 targetLink={"/home"}
//                 active={curActiveScreen === "home"}
//               />
//               <IconText
//                 iconName={"tabler:search"}
//                 displayText={"Search"}
//                 active={curActiveScreen === "search"}
//                 targetLink={"/search"}
//               />
//               <IconText
//                 iconName={"tabler:books"}
//                 displayText={"Library"}
//                 active={curActiveScreen === "library"}
//                 targetLink={"/library"}
//               />
//               <IconText
//                 iconName={"ic:sharp-library-music"}
//                 displayText={"My Music"}
//                 targetLink={"/myMusic"}
//                 active={curActiveScreen === "myMusic"}
//               />
//             </div>

//             <div className="pt-5">
//               <IconText
//                 iconName={"fluent:add-square-20-filled"}
//                 displayText={"Create Playlist"}
//                 onClick={() => {
//                   setCreatePlaylistModalOpen(true);
//                 }}
//                 // active={curActiveScreen==="myMusic"}
//               />
//               <IconText
//                 iconName={"iconoir:heart-solid"}
//                 displayText={"Liked Songs"}
//                 // active={curActiveScreen==="myMusic"}
//               />

//               {/* <IconText
//                 iconName={"iconoir:heart-solid"}
//                 displayText={"Upload Song"}
//                 targetLink={"/uploadSong"}

//                 active={curActiveScreen==="uploadSong"}
//               /> */}
//             </div>
//           </div>

//           <div className="px-5 mb-10">
//             <div className="border border-gray-100 text-white w-2/5 flex px-2 py-1 rounded full items-center justify-center hover:border-white cursor-pointer">
//               <Icon icon="icon-park-outline:earth" />
//               <div className="ml-2 text-sm font-semibold">English</div>
//             </div>
//           </div>
//         </div>
//         <div className="h-full w-4/5 bg-app-black overflow-auto">
//           {/* {this second div will be the right panel} */}
//           <div className="navbar w-full h-1/10 bg-black bg-opacity-30 flex items-end justify-end">
//             <div className="w-1/2 flex h-full items-center">
//               <div className="w-2/3 flex justify-around items-center">
//                 <TextWithHover displayText={"Premium"} />
//                 <TextWithHover displayText={"Support"} />
//                 <TextWithHover displayText={"Download"} />
//               </div>
//               <div className="h-1/2 border-r border-white "></div>

//               <div className="w-1/3 flex justify-around h-full items-center">
//                 <Link to="/uploadSong">
//                   <TextWithHover displayText={"Upload song"} />
//                 </Link>
//                 <TextWithHover displayText={"Logout"} onClick={logout} />
//                 <div className="bg-white w-10 h-10 flex items-center justify-center rounded-full font-semibold cursor-pointer">
//                   HD
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="content p-8 pt-0  overflow-auto">{children}</div>
//         </div>
//       </div>

//       {/* {This div is for current playing song} */}
//       {currentSong && (
//         <div className="w-full h-1/10 bg-black bg-opacity-30 text-white flex items-center px-4">
//           <div className="w-1/3 flex items-center">
//             <img
//               src={currentSong.thumbnail}
//               alt="currenSongThumbnail"
//               className="h-14 w-14 rounded"
//             />
//             <div className="pl-4">
//               <div className="text-sm hover:underline cursor-pointer">
//                 {currentSong.name}
//               </div>
//               <div className="text-xs text-gray-500 hover:line cursor-pointer">
//                 {currentSong.artist.firstName +
//                   " " +
//                   currentSong.artist.lastName}
//               </div>
//             </div>
//           </div>
//           <div className="w-1/2 flex justify-center  h-full flex-col items-center">
//             <div className="flex w-1/3 justify-between items-center">
//               {/* controls for the playing song go here */}
//               <Icon
//                 icon="ph:shuffle-fill"
//                 fontSize={30}
//                 className="cursor-pointer text-gray-500 hover:text-white"
//               />
//               <Icon
//                 icon="ic:twotone-skip-previous"
//                 fontSize={30}
//                 className="cursor-pointer text-gray-500 hover:text-white"
//               />
//               <Icon
//                 icon={isPaused ? "gridicons:play" : "gridicons:pause"}
//                 fontSize={50}
//                 className="cursor-pointer text-gray-500 hover:text-white"
//                 onClick={togglePlayPause}
//               />
//               <Icon
//                 icon="ic:twotone-skip-next"
//                 fontSize={30}
//                 className="cursor-pointer text-gray-500 hover:text-white"
//                 // onClick={playNextSong}
//               />
//               <Icon
//                 icon="carbon:repeat"
//                 fontSize={30}
//                 className="cursor-pointer text-gray-500 hover:text-white"
//               />
//             </div>
//             {/* <div>Progress Bar Here</div> */}
//           </div>
//           <div className="w-1/3 flex justify-end pr-4 space-x-4 items-center">
//             <Icon
//               icon="ic:twotone-playlist-add"
//               fontSize={30}
//               className="cursor-pointer text-gray-500 hover:text-white"
//               onClick={() => {
//                 setAddToPlaylistModalOpen(true);
//               }}
//             />
//             <Icon
//               icon="mdi:heart-outline"
//               fontSize={25}
//               className="cursor-pointer text-gray-500 hover:text-white"
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoggedInContainer;

