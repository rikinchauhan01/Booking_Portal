import {
  faCalendar,
  faCalendarDays,
  faPerson,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import React, { useState, useEffect } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./header.css";
import { useNavigate, Link } from "react-router-dom";
import { selectUser } from "../../redux/users/selectors";
import { useSelector } from "react-redux";

const Header = ({
  heading,
  description,
  icon,
  type,
  source,
  setSource,
  destination,
  setDestination,
}) => {
  const [openDate, setOpenDate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const { loggedInUser } = useSelector(selectUser);
  const [openOptions, setOpenOptions] = useState(false);
  const [options, setOptions] = useState({
    person: 1,
  });
  const navigate = useNavigate();

  const handleOption = (name, operation) => {
    setOptions((prev) => {
      return {
        ...prev,
        [name]: operation === "i" ? options[name] + 1 : options[name] - 1,
      };
    });
  };

  const handleSearch = () => {
    navigate(`/${type}`, {
      state: { source, destination, date, options },
    });
  };

  return (
    <div className="header">
      <div
        className={
          type === "list" ? "headerContainer listMode" : "headerContainer"
        }
        style={{ marginBottom: "-22px" }}
      >
        {type !== "list" && (
          <>
            <h1 className="headerTitle pl-5">{heading}</h1>
            <p className="headerDesc pl-5">{description}</p>

            <div className="headerSearch">
              <div className="headerSearchItem">
                <FontAwesomeIcon icon={icon} className="m-2 headerIcon" />
                <input
                  type="text"
                  placeholder="Source"
                  className="headerSearchInput"
                  onChange={(e) => setSource(e.target.value)}
                  value={source}
                />
              </div>
              <div className="headerSearchItem">
                <input
                  type="text"
                  placeholder="Destination"
                  className="headerSearchInput"
                  onChange={(e) => setDestination(e.target.value)}
                  value={destination}
                />
              </div>
              <button
                type="button"
                className="btn btn-text"
                data-toggle="modal"
                data-target="#exampleModalCenter"
              >
                <FontAwesomeIcon icon={faCalendar} className="headerIcon" />
                <span
                  onClick={() => setOpenDate(!openDate)}
                  className="headerSearchText"
                >
                  {" "}
                  {format(date[0]?.startDate, "MM/dd/yyyy")} to{" "}
                  {format(date[0]?.endDate, "MM/dd/yyyy")}
                </span>
              </button>
              <div
                className="modal fade"
                id="exampleModalCenter"
                tabindex="-1"
                role="dialog"
                aria-labelledby="exampleModalCenterTitle"
                aria-hidden="true"
              >
                <div
                  className="modal-dialog modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    <div className="modal-body">
                      <div>
                        <DateRange
                          editableDateInput={true}
                          onChange={(item) => setDate([item.selection])}
                          moveRangeOnFirstSelection={false}
                          ranges={date}
                          className="date"
                          minDate={new Date()}
                        />
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-dismiss="modal"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-text"
                data-toggle="modal"
                data-target="#exampleModalCenterPassenger"
              >
                <FontAwesomeIcon icon={faPerson} className="headerIcon" />
                <span
                  onClick={() => setOpenOptions(!openOptions)}
                  className="headerSearchText"
                >
                  {`${options.person} person`}
                </span>
              </button>

              <div
                className="modal fade"
                id="exampleModalCenterPassenger"
                tabindex="-1"
                role="dialog"
                aria-labelledby="exampleModalCenterTitle"
                aria-hidden="true"
              >
                <div
                  className="modal-dialog modal-sm modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    <div className="modal-body">
                      <div>
                        <div className="options">
                          <div className="optionItem">
                            <span className="optionText">person</span>
                            <div className="optionCounter">
                              <button
                                disabled={options.person <= 1}
                                className="optionCounterButton"
                                onClick={() => handleOption("person", "d")}
                              >
                                {" "}
                                -{" "}
                              </button>
                              <span className="optionCounterNumber">
                                {options.person}
                              </span>
                              <button
                                className="optionCounterButton"
                                onClick={() => handleOption("person", "i")}
                              >
                                {" "}
                                +{" "}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-dismiss="modal"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="headerSearchItem">
                <button className="headerBtn" onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
