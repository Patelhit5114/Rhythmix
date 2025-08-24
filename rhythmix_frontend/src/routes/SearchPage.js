import { useState } from "react";
import LoggedInContainer from "../containers/LoggedInContainers";
import { Icon } from "@iconify/react";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";
import SingleSongCard from "../components/shared/SingleSongCard";
const SearchPage = () => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [songData, setSongData] = useState([]);
  const [searchSource, setSearchSource] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const searchSong = async () => {
    if (!searchText.trim()) return;
    
    setIsLoading(true);
    try {
      // Use external API search for better results
      const response = await makeAuthenticatedGETRequest(
        `/external/search?q=${encodeURIComponent(searchText)}&source=${searchSource}&limit=20`
      );
      setSongData(response.data || []);
    } catch (error) {
      console.error("Search error:", error);
      setSongData([]);
    }
    setIsLoading(false);
  };

  return (
    <LoggedInContainer curActiveScreen="search">
      <div className="w-full py-6">
        <div className="flex flex-col space-y-4">
          {/* Search Input */}
          <div
            className={`w-1/3 p-3 text-sm rounded-full bg-gray-800 px-5 flex text-white space-x-3 items-center ${
              isInputFocused ? "border border-white" : ""
            }`}
          >
            <Icon icon="ic:baseline-search" className="text-lg" />
            <input
              type="text"
              placeholder="Search songs from Spotify, Last.fm, and more..."
              className="w-full bg-gray-800 focus:outline-none"
              onFocus={() => {
                setIsInputFocused(true);
              }}
              onBlur={() => {
                setIsInputFocused(false);
              }}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchSong();
                }
              }}
            />
          </div>
          
          {/* Search Source Filter */}
          <div className="flex space-x-3">
            {["all", "spotify", "lastfm", "local"].map((source) => (
              <button
                key={source}
                onClick={() => setSearchSource(source)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  searchSource === source
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {source === "all" ? "All Sources" : source === "lastfm" ? "Last.fm" : source.charAt(0).toUpperCase() + source.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {

         songData.length > 0?(
        <div className="pt-10 space-y-3">

        <div className="text-white">
        Showing search results for "<span className="font-bold">{searchText} </span>"
        </div>
          {songData.map((item) => {
            return (
              <SingleSongCard
                info={item}
                key={JSON.stringify(item)} 
                playSound={() => {}}
              />
            );
          })}
          
        </div>
        ):(<div className="text-white pt-10">
         Nothing to show here.
        </div>)
        }
      </div>
    </LoggedInContainer>
  );
};

export default SearchPage;
