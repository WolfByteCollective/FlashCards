/*
MIT License

Copyright (c) 2022 John Damilola, Leo Hsiang, Swarangi Gaurkar, Kritika Javali, Aaron Dias Barreto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


import { Card, Popconfirm, Button, Input, Modal } from "antd";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyImg from "assets/images/empty.svg";
import { PropagateLoader } from "react-spinners";
import http from "utils/api";
import Swal from "sweetalert2";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

interface Deck {
  id: string;
  userId: string;
  title: string;
  description: string;
  visibility: string;
  cards_count: number;
  folderId?: string; // Optional to track folder assignment
}

interface Folder {
  id: string;
  name: string;
  decks: Deck[];
}

const Dashboard = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [fetchingDecks, setFetchingDecks] = useState(false);
  const [isFolderPopupVisible, setIsFolderPopupVisible] = useState(false);
  const [selectedFolderDecks, setSelectedFolderDecks] = useState<Deck[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const flashCardUser = window.localStorage.getItem("flashCardUser");
  const { localId } = (flashCardUser && JSON.parse(flashCardUser)) || {};

  const navigate = useNavigate();

  useEffect(() => {
    fetchDecks();
    fetchFolders();
  }, []);

  useEffect(() => {
    updateArrowsVisibility();
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", updateArrowsVisibility);
      return () => slider.removeEventListener("scroll", updateArrowsVisibility);
    }
  }, [decks]);

  const fetchDecks = async () => {
    setFetchingDecks(true);
    try {
      const res = await http.get("/deck/all", { params: { localId } });
      setDecks(res.data?.decks || []);
    } catch (err) {
      console.error("Error fetching decks:", err);
    } finally {
      setFetchingDecks(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await http.get("/folders/all", { params: { userId: localId } });
      setFolders(res.data?.folders || []);
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
  };

  const handleFolderClick = async (folder: Folder) => {
    try {
      const res = await http.get(`/decks/${folder.id}`);
      setSelectedFolderDecks(res.data?.decks);
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
    setIsFolderPopupVisible(true);
  };

  const navigateToDeck = (deckId: string, deckTitle: string) => {
    navigate(`/deck/${deckId}/practice?title=${encodeURIComponent(deckTitle)}`);
  };

  const handleDeleteDeck = async (id: string) => {
    try {
      await http.delete(`/deck/delete/${id}`);
      Swal.fire("Deck Deleted Successfully!", "", "success").then(() => fetchDecks());
    } catch (err) {
      Swal.fire("Deck Deletion Failed!", "", "error");
    }
  };

  const handleAddDeckToFolder = async (deckId: string, folderId: string) => {
    try {
      await http.post("/deck/add-deck", { deckId, folderId });
      fetchDecks();
      Swal.fire("Deck added to folder!", "", "success");
    } catch (err) {
      Swal.fire("Failed to add deck to folder!", "", "error");
    }
  };

  const updateArrowsVisibility = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="dashboard-page dashboard-commons">
      <section>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <Card className="welcome-card border-[#E7EAED]">
                <div className="flex justify-between items-center">
                  <div>
                    <h3><b>Hey, Welcome Back!</b> 👋</h3>
                    <p>Let's start creating, memorizing, and sharing your flashcards.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Folders Section */}
          <div className="folder-list row mt-4">
            <div className="col-md-12">
              <p className="title">My Folders</p>
            </div>
            {folders.length === 0 ? (
              <div className="col-md-12 text-center">
                <p>No folders created yet.</p>
              </div>
            ) : (
              folders.map((folder) => (
                <div key={folder.id} className="col-md-4">
                  <div className="folder-container" onClick={() => handleFolderClick(folder)}>
                    <h5>{folder.name}</h5>
                    <p>{folder.decks.length > 0 ? `${folder.decks.length} deck(s)` : null}</p>
                    <p>{folder.decks.length === 0 ? `${folder.decks.length} deck(s)` : null}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Decks Section */}
          <div className="row mt-4">
            <div className="col-md-12">
              <p className="title">Your Library</p>
            </div>
            {fetchingDecks ? (
              <div className="col-md-12 text-center" style={{ height: "300px" }}>
                <PropagateLoader color="#221daf" />
              </div>
            ) : decks.length === 0 ? (
              <div className="row justify-content-center empty-pane">
                <div className="text-center">
                  <img className="img-fluid" src={EmptyImg} alt="No Decks" />
                  <p>No Study Deck Created Yet</p>
                </div>
              </div>
            ) : (
              <div className="slider-container">
                {canScrollLeft && (
                  <button className="arrow left" onClick={() => scroll("left")}>
                    <LeftOutlined />
                  </button>
                )}
                <div className="deck-slider" ref={sliderRef}>
                  {decks.map(({ id, title, description, visibility, cards_count }) => (
                    <div className="deck-card" key={id}>
                      <div className="d-flex justify-content-between align-items-center">
                        <Link to={`/deck/${id}/practice`}><h5>{title}</h5></Link>
                        <div className="d-flex gap-2 visibility-status align-items-center">
                          {visibility === "public" ? <i className="lni lni-world"></i> : <i className="lni lni-lock-alt"></i>}
                          {visibility}
                        </div>
                      </div>
                      <p className="description">{description}</p>
                      <p className="items-count">{cards_count} item(s)</p>
                      <div className="d-flex menu">
                        <div className="col">
                          <Link to={`/deck/${id}/practice`}><button className="btn text-left"><i className="lni lni-book"></i> Practice</button></Link>
                        </div>
                        <div className="col d-flex justify-content-center">
                          <Link to={`/deck/${id}/update`}><button className="btn text-edit"><i className="lni lni-pencil-alt"></i> Update</button></Link>
                        </div>
                        <div className="col d-flex justify-content-end align-items-center">
                          <Popconfirm
                            title="Are you sure to delete this deck?"
                            onConfirm={() => handleDeleteDeck(id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <button className="btn text-danger"><i className="lni lni-trash-can"></i> Delete</button>
                          </Popconfirm>
                        {/* </div> */}
                      {/* </div> */}
                      <select 
                        onChange={(e) => handleAddDeckToFolder(id, e.target.value)} 
                        defaultValue="" 
                        style={{ color: "#007bff", border: "1px solid #007bff", padding: "5px", borderRadius: "4px" }}
                      >
                        <option value="" disabled style={{ color: "#999" }}>
                        Add to Folder
                        </option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                      ))}
                      </select>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
                {canScrollRight && (
                  <button className="arrow right" onClick={() => scroll("right")}>
                    <RightOutlined />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Folder Decks Modal */}
        <Modal
          title="Folder Decks"
          open={isFolderPopupVisible}
          onCancel={() => setIsFolderPopupVisible(false)}
          footer={null}
        >
          {selectedFolderDecks.length === 0 ? (
            <p>No decks in this folder.</p>
          ) : (
            selectedFolderDecks.map(({ id, title }, index) => (
              <div key={index}>
                <Button className="folder-deck-button" onClick={() => navigateToDeck(id, title)}>
                  {title}
                </Button>
              </div>
            ))
          )}
        </Modal>
      </section>
    </div>
  );
};

export default Dashboard;
