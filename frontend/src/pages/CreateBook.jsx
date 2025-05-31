import React, { useState } from "react";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateBook = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publishYear, setPublishYear] = useState("");
  const [isbn, setIsbn] = useState("");
  const [summary, setSummary] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSaveBook = async () => {
    if (!title || !author || !publishYear || !summary) {
      alert("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("publishYear", publishYear);
    formData.append("isbn", isbn);
    formData.append("summary", summary);

    if (coverImage) {
      formData.append("image", coverImage);
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5555/books", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Book created successfully!");

      navigate("/");
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert(`Error: ${error.response?.data?.message || "Failed to save book"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  return (
    <div className="p-4">
      <BackButton />
      <h1 className="text-3xl my-4">Create Book</h1>
      {loading ? <Spinner /> : ""}
      <div className="flex flex-col border-2 border-sky-400 rounded-xl w-[600px] p-4 mx-auto">
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-500">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-2 border-gray-500 px-4 py-2 w-full"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-500">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border-2 border-gray-500 px-4 py-2 w-full"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-500">Publish Year</label>
          <input
            type="text"
            value={publishYear}
            onChange={(e) => setPublishYear(e.target.value)}
            className="border-2 border-gray-500 px-4 py-2 w-full"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-500">ISBN</label>
          <input
            type="text"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            className="border-2 border-gray-500 px-4 py-2 w-full"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-500">Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="border-2 border-gray-500 px-4 py-2 w-full"
            rows={4}
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-500">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border-2 border-gray-500 px-4 py-2 w-full"
          />
          {coverImage && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {coverImage.name} ({Math.round(coverImage.size / 1024)}{" "}
              KB)
            </p>
          )}
        </div>
        <button className="p-2 bg-sky-300 m-8" onClick={handleSaveBook}>
          Save
        </button>
      </div>
    </div>
  );
};

export default CreateBook;
