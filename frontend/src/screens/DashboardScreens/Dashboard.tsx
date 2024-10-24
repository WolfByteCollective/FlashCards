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
}

const Dashboard = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [fetchingDecks, setFetchingDecks] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null); // Ref for the slider container
  const [canScrollLeft, setCanScrollLeft] = useState(false); // Track left scroll visibility
  const [canScrollRight, setCanScrollRight] = useState(false); // Track right scroll visibility
  const flashCardUser = window.localStorage.getItem("flashCardUser");
  const { localId } = (flashCardUser && JSON.parse(flashCardUser)) || {};

  useEffect(() => {
    fetchDecks();
  }, []);

  useEffect(() =>{
    updateArrowsVisibility(); // Check arrows visibility when decks load
    const slider = sliderRef.current
    if (slider){
      slider.addEventListener("scroll", updateArrowsVisibility); // Listen to scroll events
      return () => slider.removeEventListener("scroll", updateArrowsVisibility); // Cleanup
    }
  }, [decks]);

  const fetchDecks = async () => {
    setFetchingDecks(true);
    const params = { localId };
    try {
      const res = await http.get("/deck/all", { params });
      setDecks(res.data?.decks || []);
    } catch (err) {
      setDecks([]);
    } finally {
      setFetchingDecks(false);
    }
  };

  const handleDeleteDeck = async (id: string) => {
    try {
      await http.delete(`/deck/delete/${id}`);
      Swal.fire({
        icon: "success",
        title: "Deck Deleted Successfully!",
        confirmButtonColor: "#221daf",
      }).then(() => {
        fetchDecks(); // Refresh decks
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Deck Deletion Failed!",
        confirmButtonColor: "#221daf",
      });
    }
  };

  const updateArrowsVisibility = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0); // Show left arrow if not at the beginning
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth); // Show right arrow if not at the end
    }
  };

  // Handle horizontal scrolling on arrow button clicks
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
                    <h3>
                      <b>Hey, Welcome Back!</b> 👋
                    </h3>
                    <p>Let's start creating, memorizing, and sharing your flashcards.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

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
              <div className="slider-container"> {/* Slider wrapper */}
                {canScrollLeft && ( // Conditionally render left arrow
                  <button className="arrow left" onClick={() => scroll("left")}>
                    <LeftOutlined />
                  </button>
                )}
                <div className="deck-slider" ref={sliderRef}>  {/* Slider container */}
                  {decks.map(({ id, title, description, visibility, cards_count }) => (
                    <div className="deck-card" key={id}>  {/* Parent div to wrap everything */}
                      <div className="d-flex justify-content-between align-items-center">
                        <Link to={`/deck/${id}/practice`}>
                          <h5>{title}</h5>  {/* Deck title */}
                        </Link>

                        <div className="d-flex gap-2 visibility-status align-items-center">
                          {/* Visibility icon */}
                          {visibility === "public" ? (
                            <i className="lni lni-world"></i>
                          ) : (
                            <i className="lni lni-lock-alt"></i>
                          )}
                          {visibility}
                        </div>
                      </div>

                      <p className="description">{description}</p>  {/* Deck description */}
                      <p className="items-count">{cards_count} item(s)</p>  {/* Cards count */}

                      <div className="d-flex menu">  {/* Actions menu */}
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
                {canScrollRight && ( // Conditionally render right arrow
                  <button className="arrow right" onClick={() => scroll("right")}>
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
