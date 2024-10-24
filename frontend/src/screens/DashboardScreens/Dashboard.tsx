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
import { Card, Popconfirm } from "antd";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import EmptyImg from "assets/images/empty.svg";
import { PropagateLoader } from "react-spinners";
import http from "utils/api";
import "./styles.scss";
import Swal from "sweetalert2";
import { LeftOutlined, RightOutlined } from "@ant-design/icons"; // Ant Icons for Arrows

interface Deck {
  id: string;
  userId: string;
  title: string;
  description: string;
  visibility: string;
  cards_count: number;
  lastOpened?: string; // Optional for recent decks
}

const Dashboard = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [recentDecks, setRecentDecks] = useState<Deck[]>([]);
  const [fetchingDecks, setFetchingDecks] = useState(false);
  const sliderRefLibrary = useRef<HTMLDivElement>(null); // Ref for the library slider container
  const sliderRefRecent = useRef<HTMLDivElement>(null); // Ref for the recent decks slider container
  const [canScrollLeftLib, setCanScrollLeftLib] = useState(false); // Track left scroll visibility for library
  const [canScrollRightLib, setCanScrollRightLib] = useState(false); // Track right scroll visibility for library
  const [canScrollLeftRec, setCanScrollLeftRec] = useState(false); // Track left scroll visibility for recent decks
  const [canScrollRightRec, setCanScrollRightRec] = useState(false); // Track right scroll visibility for recent decks

  const flashCardUser = window.localStorage.getItem("flashCardUser");
  const { localId } = (flashCardUser && JSON.parse(flashCardUser)) || {};

  useEffect(() => {
    fetchDecks(); // Fetch decks on component mount
  }, []);

  useEffect(() => {
    updateArrowsVisibilityLibrary();
    updateArrowsVisibilityRecent();
    const sliderLib = sliderRefLibrary.current;
    const sliderRec = sliderRefRecent.current;

    if (sliderLib) {
      sliderLib.addEventListener("scroll", updateArrowsVisibilityLibrary);
      return () => sliderLib.removeEventListener("scroll", updateArrowsVisibilityLibrary);
    }
    if (sliderRec) {
      sliderRec.addEventListener("scroll", updateArrowsVisibilityRecent);
      return () => sliderRec.removeEventListener("scroll", updateArrowsVisibilityRecent);
    }
  }, [decks]);

  const fetchDecks = async () => {
    setFetchingDecks(true);
    const params = { localId };
    try {
      const res = await http.get("/deck/all", { params });
      const _decks = res.data?.decks || [];
      setDecks(_decks);

      // Filter for recent decks opened in the last 5 days
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const recent = _decks
        .filter((deck: Deck) => {
          if (deck.lastOpened) {
            return new Date(deck.lastOpened) >= fiveDaysAgo;
          }
          return false;
        })
        .sort((a: Deck, b: Deck) => new Date(b.lastOpened!).getTime() - new Date(a.lastOpened!).getTime()); // Sort by most recent first
  
      setRecentDecks(recent);
    } catch (err) {
      setDecks([]);
      setRecentDecks([]);
    } finally {
      setFetchingDecks(false);
    }
  };

  // This function will be called when a user opens a deck
  const updateLastOpened = async (deckId: string) => {
    const timestamp = new Date().toISOString(); // Get the current timestamp
    await http.patch(`/deck/updateLastOpened/${deckId}`, { lastOpened: timestamp });
    fetchDecks(); // Refetch the decks to update both 'decks' and 'recentDecks'
  };

  const handleDeleteDeck = async (id: string) => {
    try {
      await http.delete(`/deck/delete/${id}`);
      Swal.fire({
        icon: "success",
        title: "Deck Deleted Successfully!",
        confirmButtonColor: "#221daf",
      }).then(() => {
        fetchDecks(); // Refresh decks after deletion
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Deck Deletion Failed!",
        confirmButtonColor: "#221daf",
      });
    }
  };

  const updateArrowsVisibilityLibrary = () => {
    if (sliderRefLibrary.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRefLibrary.current;
      setCanScrollLeftLib(scrollLeft > 0);
      setCanScrollRightLib(scrollLeft + clientWidth < scrollWidth);
    }
  };

  const updateArrowsVisibilityRecent = () => {
    if (sliderRefRecent.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRefRecent.current;
      setCanScrollLeftRec(scrollLeft > 0);
      setCanScrollRightRec(scrollLeft + clientWidth < scrollWidth);
    }
  };

  const scrollLibrary = (direction: "left" | "right") => {
    if (sliderRefLibrary.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      sliderRefLibrary.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRecent = (direction: "left" | "right") => {
    if (sliderRefRecent.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      sliderRefRecent.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="dashboard-page dashboard-commons">
      <section>
        <div className="container">
          {/* Welcome Card */}
          <div className="row">
            <div className="col-md-12">
              <Card className="welcome-card border-[#E7EAED]">
                <div className="flex justify-between items-center">
                  <div>
                    <h3>
                      <b>Hey, Welcome Back!</b> 👋
                    </h3>
                    <p>Let's start creating, memorizing, and sharing your flashcards.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          {/* Your Library Section */}
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
                {canScrollLeftLib && (
                  <button className="arrow left" onClick={() => scrollLibrary("left")}>
                    <LeftOutlined />
                  </button>
                )}
                <div className="deck-slider" ref={sliderRefLibrary}>
                  {decks.map(({ id, title, description, visibility, cards_count }) => (
                    <div className="deck-card" key={id}>
                      <div className="d-flex justify-content-between align-items-center">
                        <Link to={`/deck/${id}/practice`} onClick={() => updateLastOpened(id)}>
                          <h5>{title}</h5>
                        </Link>
                        <div className="d-flex gap-2 visibility-status align-items-center">
                          {visibility === "public" ? (
                            <i className="lni lni-world"></i>
                          ) : (
                            <i className="lni lni-lock-alt"></i>
                          )}
                          {visibility}
                        </div>
                      </div>
                      <p className="description">{description}</p>
                      <p className="items-count">{cards_count} item(s)</p>
                      <div className="d-flex menu">
                        <div className="col">
                          <Link to={`/deck/${id}/practice`}>
                            <button className="btn text-left">
                              <i className="lni lni-book"></i> Practice
                            </button>
                          </Link>
                        </div>
                        <div className="col d-flex justify-content-center">
                          <Link to={`/deck/${id}/update`}>
                            <button className="btn text-edit">
                              <i className="lni lni-pencil-alt"></i> Update
                            </button>
                          </Link>
                        </div>
                        <div className="col d-flex justify-content-end">
                          <Popconfirm
                            title="Are you sure to delete this deck?"
                            onConfirm={() => handleDeleteDeck(id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <button className="btn text-danger">
                              <i className="lni lni-trash-can"></i> Delete
                            </button>
                          </Popconfirm>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {canScrollRightLib && (
                  <button className="arrow right" onClick={() => scrollLibrary("right")}>
                    <RightOutlined />
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Recent Decks Section */}
          <div className="row mt-4">
            <div className="col-md-12">
              <p className="title">Recent Decks</p>
            </div>
            {recentDecks.length === 0 ? (
              <div className="row justify-content-center">
                <p>No Recent Decks Opened</p>
              </div>
            ) : (
              <div className="slider-container">
                {canScrollLeftRec && (
                  <button className="arrow left" onClick={() => scrollRecent("left")}>
                    <LeftOutlined />
                  </button>
                )}
                <div className="deck-slider" ref={sliderRefRecent}>
                  {recentDecks.map(({ id, title, description, visibility, cards_count }) => (
                    <div className="deck-card" key={id}>
                      <div className="d-flex justify-content-between align-items-center">
                        <Link to={`/deck/${id}/practice`} onClick={() => updateLastOpened(id)}>
                          <h5>{title}</h5>
                        </Link>
                        <div className="d-flex gap-2 visibility-status align-items-center">
                          {visibility === "public" ? (
                            <i className="lni lni-world"></i>
                          ) : (
                            <i className="lni lni-lock-alt"></i>
                          )}
                          {visibility}
                        </div>
                      </div>
                      <p className="description">{description}</p>
                      <p className="items-count">{cards_count} item(s)</p>
                        
                    </div>
                  ))}
                </div>
                {canScrollRightRec && (
                  <button className="arrow right" onClick={() => scrollRecent("right")}>
                    <RightOutlined />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
