import "./App.css";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const CLIENT_ID = "ed940ca859d64f898045a498f18233ce";
const CLIENT_SECRET = "b8682359291a4530aa9b43f6eeb20e9f";

function Pagination({ itemsPerPage, totalItems, paginate }) {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
      <nav>
        <ul className='pagination'>
          {pageNumbers.map(number => (
              <li key={number} className='page-item'>
                <a onClick={(e) => {e.preventDefault(); paginate(number);}} href='!#' className='page-link'>
                  {number}
                </a>
              </li>
          ))}
        </ul>
      </nav>
  );
}

function NavigationBar({children}) {
  return (
      <div className="topnav">
        {children}
      </div>
  )
}

function Logo() {
  return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        <img src={`${process.env.PUBLIC_URL}/logo.gif`} alt="Logo" className="poppins-bold-logo" style={{width: '75px', height: '75px', marginRight: '20px'}}/>
        <h1 className="poppins-bold-logo">Kung-Fu Soundscape</h1>
      </div>
  )
}

function NumResult({music}) {
  return (
      <p className="poppins-regular">
        Found <strong>{music.length}</strong> results
      </p>
  )
}

function Search({setMusic, music}) {
  const [query, setQuery] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const authParameter = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
          "grant_type=client_credentials&client_id=" +
          CLIENT_ID +
          "&client_secret=" +
          CLIENT_SECRET,
    };
    fetch("https://accounts.spotify.com/api/token", authParameter)
        .then((result) =>  result.json().then((data) =>
            setAccessToken(data.access_token)));
  },[]);


  async function search() {
    console.log("Searching for " + query);
    var trackParameters = {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    var tracks = await fetch (
        "https://api.spotify.com/v1/search?q=" + query + "&type=track&limit=50",
        trackParameters)
        .then((result) => result.json().then((data) =>
            setMusic(data.tracks.items)));

    console.log(music);

  }
  return (
      <input
          className="search"
          type="text"
          placeholder="Search music"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              search();
            }
          }}
          onChange={(e) => setQuery(e.target.value)}
      />
  );
}


function Box({children, title, subtitle}) {
  return (
      <div className="container-box">
        <h2 className="poppins-bold-title">{title}</h2>
        <h3 className="poppins-semibold-title">{subtitle}</h3>
        {children}
      </div>
  )
}

function Music({ music, playlist, addToPlaylist, removeFromPlaylist }) {
  const togglePlaylist = (music) => {
    if (playlist.some((m) => m.id === music.id)) {
      removeFromPlaylist(music);
    } else {
      addToPlaylist(music);
    }
  };

  const PopularityRating = ({popularity}) => {
    const stars = Math.round(popularity / 20); // This will give a number between 0 and 5
    const starsArray = Array(stars).fill('⭐');
    const tooltipText = `Popularity: ${popularity}`;

    return (
        <div title={tooltipText}>
          {starsArray.map((star, index) => (
              <FontAwesomeIcon key={index} icon={faStar} />
          ))}
        </div>
    );
  };

  return (
      <>
        {music.map((music) => (
            <div key={music.id} className="music-card">
              <img src={music.album.images[0].url} alt="Album cover" className="music-image"/>
              <div className="music-info">
                <p className="music-name">{music.name}</p>
                <p className="music-artist">{music.artists[0].name}</p>
              </div>
              <button
                  className={playlist.some((m) => m.id === music.id) ? "liked" : ""}
                  onClick={() => togglePlaylist(music)}
              >
                {playlist.some((m) => m.id === music.id) ? (
                    <span role="img" aria-label="heart" className="green-heart">
              Remove from Playlist
            </span>
                ) : (
                    <span role="img" aria-label="heart" className="white-heart">
              Add to Playlist
            </span>
                )}
              </button>
              &nbsp; <PopularityRating popularity={music.popularity}/>
            </div>
        ))}
      </>
  );
}


function Playlist({playlist, removeFromPlaylist}) {
  const [isPlaying, setIsPlaying] = useState({});

  const handlePlay = (e) => {
    if (e.target.tagName.toLowerCase() === 'audio') {
      const audioElement = e.target;
      const songId = audioElement.dataset.id;
      if (audioElement.paused) {
        audioElement.play();
        setIsPlaying(prevState => ({ ...prevState, [songId]: true }));
        return;
      } else {
        audioElement.pause();
        setIsPlaying(prevState => ({ ...prevState, [songId]: false }));
        return
      }
    }
  };

  if (playlist.length === 0) {
    return <p>There are no songs in the playlist.</p>
  }

  return (
      <div className="playlist">
        {playlist.map((music) => (
            <div key={music.id} className="song-card">
              <img src={music.album.images[0].url} alt="Album cover" className={`song-image ${isPlaying[music.id] ? 'rotate' : ''}`}/>
              <div className="song-info">
                <p className="song-name">{music.name}</p>
                <p className="song-artist">{music.artists[0].name}</p>
              </div>
              {music.preview_url ? (
                  <audio controls style={{marginRight: '10px'}} onClick={handlePlay} data-id={music.id}>
                    <source src={music.preview_url} type="audio/mpeg"/>
                    Your browser does not support the audio element.
                  </audio>
              ) : (
                  <p>Audio track not available.</p>
              )}
              <button onClick={() => removeFromPlaylist(music)} style={{border: 'none', background: 'none'}}>
                <span role="img" aria-label="remove">&#10060;</span> {/* Unicode character for cross mark */}
              </button>
            </div>
        ))}
      </div>
  );
}

function PlaylistCard({ playlistName, playlist, removeFromPlaylist }) {
  return (
      <div className="playlist-card">
        <h3>{playlistName}</h3>
        <Playlist playlist={playlist} removeFromPlaylist={removeFromPlaylist}/>
      </div>
  );
}

function Main({children}) {
  return (
      <div>
        <div className="container-main">{children}</div>
      </div>
  )
}

function SortDropdown({handleSortChange}) {
  return (
      <div className="container-sort">
        &nbsp; &nbsp; <label className="poppins-semibold">Sort By: </label>
        <select id="sort" className="poppins-bold sort-dropdown" onChange={handleSortChange}>
          <option className="poppins-semibold" value="name">Title</option>
          <option className="poppins-semibold" value="artist">Artist</option>
          <option className="poppins-semibold" value="popularity">Popularity</option>
        </select>
      </div>
  );
}

function App() {

  useEffect(() => {
    document.title = "Kung-Fu Soundscape";
  }, []);

  const [music, setMusic] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMusic, setFilteredMusic] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMusicItems = music.slice(indexOfFirstItem, indexOfLastItem);
  const [playlistName, setPlaylistName] = useState("");

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCreatePlaylist = () => {
    const name = prompt("Enter the name of the playlist:");
    if (name) {
      setPlaylistName(name);
      setShowPlaylist(true);
    }
  };

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredMusic(music);
    } else {
      const filtered = music.filter(
          (music) => {
            if (music.name && music.artist) {
              return music.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  music.artists[0].name.toLowerCase().includes(searchQuery.toLowerCase())
            }
            return false;
          });
      setFilteredMusic(filtered);
    }
  }, [searchQuery, music]);

  const addToPlaylist = (music) => {
    if (!playlist.some((m) => m.id === music.id)) {
      setPlaylist([...playlist, music]);
    }
  };

  const removeFromPlaylist = (music) => {
    setPlaylist(playlist.filter((m) => m.id!== music.id));
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  useEffect(() => {
    const sortedMusic = [...music].sort((a, b) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "artist":
          return a.artists[0].name.localeCompare(b.artists[0].name);
        case "popularity":
          return b.popularity - a.popularity;
        default:
          return 0;
      }
    });

    setMusic(sortedMusic);
  }, [sortOption]);

  return (
      <div>
        <NavigationBar>
          <div className="logo-container">
            <Logo/>
          </div>
          <div className="search-container">
            <Search setMusic={setMusic}/>
          </div>
        </NavigationBar>
        <Main>
          <Box title={"Music List"} subtitle={"Music is everything, just like Kung-Fu."}>
            <div className="music-list-header">
              <NumResult music={filteredMusic}/>
              <SortDropdown handleSortChange={handleSortChange}/>
            </div>
            <Music
                music={currentMusicItems}
                playlist={playlist}
                addToPlaylist={addToPlaylist}
                removeFromPlaylist={removeFromPlaylist}
            />
            <Pagination itemsPerPage={itemsPerPage} totalItems={music.length} paginate={paginate}/>
          </Box>
          <Box title = {"Playlist"} subtitle = {"Add your training playlist."} playlist = {"Playlist"}>
            <button className="create-playlist-button" onClick={handleCreatePlaylist}>Create Playlist</button>
            {showPlaylist ? (
                <PlaylistCard playlistName={playlistName} playlist={playlist} removeFromPlaylist={removeFromPlaylist}/>
            ) : (
                <p>No songs in the playlist. Click on "Create Playlist" to add songs.</p>
            )}
          </Box>
        </Main>
      </div>
  );
}

export default App;