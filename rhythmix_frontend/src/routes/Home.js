import Tuneup_logo from "../images/logo_transparent.png";
import IconText from "../components/shared/Icontext";
import { Icon } from "@iconify/react";
import TextWithHover from "../components/shared/Textwithhover";
const focusCardsData = [
  {
    title: "Peaceful Piano",
    description: "Relax and indulge with beautiful piani pieces",
    imgUrl:
      "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Deep Focus",
    description: "Keep calm and focus with this music",
    imgUrl:
      "https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c3R1ZHl8ZW58MHx8MHx8fDA%3D",
  },
  {
    title: "Instrumental Study",
    description: "Focus with study in the background",
    imgUrl:
      "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dmlvbGlufGVufDB8fDB8fHww",
  },
  {
    title: "Focus Flow",
    description: "Up tempo instrumental hip hop beats",
    imgUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdvcmt8ZW58MHx8MHx8fDA%3D",
  },
  {
    title: "Beats to think to",
    description: "Focus with deep techno and tech house",
    imgUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const TuneupCardsData = [
  {
    title: "Chillout Lounge",
    description: "Just lean back and enjoy relaxed beats",
    imgUrl:
      "https://images.unsplash.com/photo-1586627119067-1a8528e73ba7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGNoaWxsJTIwb3V0fGVufDB8fDB8fHww",
  },
  {
    title: "All Out 2023s",
    description: "The biggest songs of the 2023s",
    imgUrl:
      "https://plus.unsplash.com/premium_photo-1669330405075-cb6181743d21?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fDIwMjN8ZW58MHx8MHx8fDA%3D",
  },
  {
    title: "Chill Hits",
    description: "Kick back to the best new and recent chill hits",
    imgUrl:
      "https://images.unsplash.com/photo-1598016915208-3e873e4a6e7b?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTh8fGNoaWxsJTIwb3V0fGVufDB8fDB8fHww",
  },
  {
    title: "Web Series Hits",
    description: "Playlist dedicated to all web series lovers",
    imgUrl:
      "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bW92aWVzJTIwJTI2JTIwd2ViJTIwc2VyaWVzfGVufDB8fDB8fHww",
  },
  {
    title: "Big on the internet",
    description: "iykyk",
    imgUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bXVzaWN8ZW58MHx8MHx8fDA%3D",
  },
];


const SoundCardsData = [
  {
    title: "Hot Hits Hindi",
    description: "Hottest Hindi music served here",
    imgUrl:
      "https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20231124191036-500x500.jpg",
  },
  {
    title: "Bollywood Mush",
    description: "Let these songs be the background score to your love story",
    imgUrl:
      "https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230927155213-500x500.jpg",
  },
  {
    title: "New Music Hindi",
    description: "Your daily dose of the latest Hindi tracks",
    imgUrl:
      "https://c.saavncdn.com/878/Akhiyaan-Gulaab-From-Teri-Baaton-Mein-Aisa-Uljha-Jiya-Hindi-2024-20240119131017-500x500.jpg",
  },
  {
    title: "Bollywood Dance india",
    description: "Party-ready, biggest Bollywood dance tracks of last 10 years.",
    imgUrl:
      "https://c.saavncdn.com/401/Loveyatri-A-Journey-Of-Love-Hindi-2018-20181003-500x500.jpg",
  },
  {
    title: "The Remix Station",
    description: "Your jukebox for all the remixes and mashups",
    imgUrl:
      "https://c.saavncdn.com/789/Bollywood-Remix-Hindi-2019-20190701144103-500x500.jpg",
  },
];

const Home = () => {
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
          {/* <div className="logoDiv bg-black py-4 flex items-center justify-center">
          <img
            src={Tuneup_logo}
            alt="tuneup logo"
            width="185"
            className="flex items-center"
          />
          </div> */}
          <div className="py-5">
            <IconText
              iconName={"ant-design:home-filled"}
              displayText={"Home"}
              active
            />
            <IconText iconName={"tabler:search"} displayText={"Search"} />
            <IconText iconName={"tabler:books"} displayText={"Library"} />
          </div>

          <div className="pt-5">
            <IconText
              iconName={"fluent:add-square-20-filled"}
              displayText={"Create Playlist"}
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
      <div className="h-full w-4/5 bg-app-black overflow-auto">
        {/* {this second div will be the right panel} */}
        <div className="navbar w-full h-1/10 bg-black bg-opacity-30 flex items-end justify-end">
          <div className="w-1/2 flex h-full items-center">
            <div className="w-3/5 flex justify-around items-center">
              <TextWithHover displayText={"Premium"} />
              <TextWithHover displayText={"Support"} />
              <TextWithHover displayText={"Download"} />
            </div>
            <div className="h-1/2 border-r border-white "></div>

            <div className="w-2/5 flex justify-around h-full items-center">
              <TextWithHover displayText={"Sign up"} />

              <div className="bg-white h-2/3 px-8 flex items-center justify-center rounded-full font-semibold cursor-pointer">
                Log in
              </div>
            </div>
          </div>
        </div>
        <div className="content p-8 pt-0  overflow-auto">
          <PlaylistView titleText="Focus" cardsData={focusCardsData} />
          <PlaylistView
            titleText="Tuneup playlists "
            cardsData={TuneupCardsData}
          />
          <PlaylistView
            titleText="Sound for india"
            cardsData={SoundCardsData}
          />
        </div>
      </div>
    </div>
  );
};

const PlaylistView = ({ titleText, cardsData }) => {
  return (
    <div className="text-white mt-8">
      <div className="text-xl font-semibold mb-5">{titleText}</div>
      <div className="w-full flex justify-between space-x-4">
        {
          //cards data will be an array
          cardsData.map((item) => {
            return (
              <Card
                title={item.title}
                description={item.description}
                imgUrl={item.imgUrl}
              />
            );
          })
        }
      </div>
    </div>
  );
};

const Card = ({ title, description, imgUrl }) => {
  return (
    <div className="bg-black bg-opacity-40 w-1/5 p-4 rounded-lg">
      <div className="pb-4 pt-2">
        <img className="w-full rounded-md" src={imgUrl} alt="label"></img>
      </div>
      <div className="text-white font-semibold py-3"> {title}</div>
      <div className="text-gray-500 text-sm">{description}</div>
    </div>
  );
};

export default Home;
