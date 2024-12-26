import React, { useState, useEffect } from "react";
import axios from "axios";
import noData from "./no_data_found-removebg-preview.png"
const VideoDashboard = () => {
  const [filters, setFilters] = useState({
    sortBy: "published_at",
    sortOrder: "desc",
  });
  // const [filters, setFilters] = useState({ sortBy: 'published_at', sortOrder: 'asc' });

  const [videos, setVideos] = useState([]);
  const [currentVideos, setCurrentVideos] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search,setSearch]=useState("")
  const [loading, setLoading] = useState(false);

  const videosPerPage = 10;
 
  const fetchVideos = async (page) => {
    console.log(filters.search, page);

    setLoading(true);
    try {
      const response = await axios.get(
        `https://fampay-backend-assignment-3iyr.onrender.com/api/youtube/videos/?page=${page}&search=${search}`
      );
      console.log(response.data);
      console.log(response);
      setVideos(response.data.results);
      setTotalCount(response.data.count);
      const indexOfLastVideo = currentPage * videosPerPage;
      const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
      setCurrentVideos(response.data.results);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(currentPage);
  }, [currentPage, search]);

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  

  const applyFiltersAndSort = (field,order) => {
    setLoading(true)
    let processedVideos = [...videos];

    // Filter by search
    if (search.trim()) {
      processedVideos = processedVideos.filter((video) =>
        video.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort videos
    processedVideos.sort((a, b) => {
      if (field === "published_at") {
        return order === "asc"
          ? new Date(a[field]) - new Date(b[field])
          : new Date(b[field]) - new Date(a[field]);
      } else if (field === "title" || field === "description") {
        return order === "asc"
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      }
      return 0;
    });

    setCurrentVideos(processedVideos);
    setLoading(false)
  };


  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split(":");
    setFilters({ sortBy: field, sortOrder: order });
    applyFiltersAndSort(field,order)
  };

  function convertYouTubeUrl(url) {
    const videoId = url.split("v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Paginate the videos

  // const currentVideos = videos?.slice(indexOfFirstVideo, indexOfLastVideo);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Video Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search videos..."
          value={search}
          onChange={(e)=> setSearch(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg shadow-sm"
        />

        <select
          value={`${filters.sortBy}:${filters.sortOrder}`}
          onChange={handleSortChange}
          className="w-full md:w-1/4 px-4 py-2 border rounded-lg shadow-sm"
        >
          <option value="published_at:desc">Newest First</option>
          <option value="published_at:asc">Oldest First</option>
          <option value="title:asc">Title (A-Z)</option>
          <option value="title:desc">Title (Z-A)</option>
        </select>
      </div>

      {loading ? (
        // <div>Loading...</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-between animate-pulse"
            >
              <div className="bg-gray-300 h-60 mb-4 rounded-md"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentVideos?.map((video) => (
            <div
              key={video.id}
              className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-between"
            >
              <div>
                <iframe
                  src={convertYouTubeUrl(video.video_url)}
                  title={video.title}
                  className="w-full h-60 mb-4 rounded-md"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>

                <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {video.description}
                </p>
              </div>
              <p className="text-xs text-gray-500 font-semibold">
                Published: {new Date(video.published_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

{
  currentVideos?.length == 0 && <div className="text-center flex justify-center">
   <img src={noData} />
    </div>
}
      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-6">
        {Array.from({ length: Math.ceil(totalCount / videosPerPage) }).map(
          (_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`px-4 py-2 border rounded-lg ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-white text-blue-500"
              }`}
            >
              {index + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default VideoDashboard;
