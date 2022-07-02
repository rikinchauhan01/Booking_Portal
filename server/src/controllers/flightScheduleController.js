const db = require("../models");
const { Op } = require("sequelize");
const Flight = db.flight_details;
const City = db.cities;
const createError = require("../utils/error");
const FlightSchedule = db.flight_schedule;
const Apifeatures = require("../utils/apiFeatures");
const {
  findFlightScheduleById,
  findAllFlightSchedules,
  findAllFlightSchedulesByFlightId,
} = require("../dao/flight.dao");

async function checkExistsFlight(id) {
  const flights = await Flight.findAll({ where: { id: id } });
  return flights.length > 0 ? true : false;
}

async function checkExistsFlightSchedule(id) {
  const flightSchedules = await FlightSchedule.findAll({ where: { id } });
  return flightSchedules.length > 0 ? true : false;
}

async function checkExistsCity(id) {
  const cities = await City.findAll({ where: { id } });
  return cities.length > 0 ? true : false;
}

const createFlightSchedule = async (req, res, next) => {
  try {
    const flight_id = req.body.flight_id;
    const source = req.body.source;
    const destination = req.body.destination;
    const departure_time = req.body.departure_time;
    const arrival_time = req.body.arrival_time;
    const total_available_seats = req.body.total_available_seats;
    const price_per_seat = req.body.price_per_seat;

    const flightStatus = await checkExistsFlight(flight_id);
    const sourceCityStatus = await checkExistsCity(source);
    const destinationCityStatus = await checkExistsCity(destination);
    if (!flightStatus) {
      return next(createError(422, "Error flight does not exists"));
    }
    if (!sourceCityStatus) {
      return next(createError(422, "Error source city does not exists"));
    }
    if (!destinationCityStatus) {
      return next(createError(422, "Error destination city does not exists"));
    }
    if (source == destination) {
      return next(
        createError(
          422,
          "Error source city and destination city cannot be same"
        )
      );
    }
    if (arrival_time == departure_time) {
      return next(
        createError(422, "Error arrival time and departure time cannot be same")
      );
    }
    if (departure_time > arrival_time) {
      return next(
        createError(
          422,
          "Error departure time of source city cannot be greater than arrival time of destination city"
        )
      );
    }

    if (total_available_seats < 0) {
      return next(
        createError(422, "Error total available seats cannot be negative")
      );
    }
    if (total_available_seats == 0) {
      return next(
        createError(422, "Error total available seats cannot be zero")
      );
    }
    if (price_per_seat < 0) {
      return next(createError(422, "Error price per seat cannot be negative"));
    }
    if (price_per_seat == 0) {
      return next(createError(422, "Error price per seat cannot be zero"));
    }
    const flightSchedule = await FlightSchedule.create(req.body);
    const data = await flightSchedule.save();
    return res.json({
      message: "Flight schedule created successfully",
      status: true,
      data: data,
    });
  } catch (error) {
    return next(
      createError(500, "Error while creating flight schedule " + error)
    );
  }
};

const updateFlightSchedule = async (req, res, next) => {
  try {
    const flightScheduleId = req.params.id;
    const flightId = req.body.flight_id;
    const source = req.body.source;
    const destination = req.body.destination;
    const departureTime = req.body.departure_time;
    const arrivalTime = req.body.arrival_time;
    const totalAvailableSeats = req.body.total_available_seats;
    const pricePerSeat = req.body.price_per_seat;

    const flightScheduleStatus = await checkExistsFlightSchedule(
      flightScheduleId
    );
    const flightStatus = await checkExistsFlight(flightId);
    const sourceCityStatus = await checkExistsCity(source);
    const destinationCityStatus = await checkExistsCity(destination);

    if (!flightScheduleStatus) {
      return next(createError(422, "Error flight schedule does not exists"));
    }
    if (!flightStatus) {
      return next(createError(422, "Error flight number does not exists"));
    }
    if (!sourceCityStatus) {
      return next(createError(422, "Error source city does not exists"));
    }
    if (!destinationCityStatus) {
      return next(createError(422, "Error destination city does not exists"));
    }
    if (arrivalTime == departureTime) {
      return next(
        createError(422, "Error arrival time and departure time cannot be same")
      );
    }
    if (departureTime > arrivalTime) {
      return next(
        createError(
          422,
          "Error departure time of source city cannot be greater than arrival time of destination city"
        )
      );
    }
    if (totalAvailableSeats < 0) {
      return next(
        createError(422, "Error total available seats cannot be negative")
      );
    }
    if (pricePerSeat < 0) {
      return next(createError(422, "Error price per seat cannot be negative"));
    }
    if (pricePerSeat == 0) {
      return next(createError(422, "Error price per seat cannot be zero"));
    }
    const flightSchedule = await FlightSchedule.update(req.body, {
      where: { id: flightScheduleId },
    });
    return res.json({
      data: "Flight schedule updated successfully",
      status: true,
    });
  } catch (error) {
    return next(
      createError(500, "Error while updating flight schedule " + error)
    );
  }
};

const deleteFlightSchedule = async (req, res, next) => {
  try {
    const id = req.params.id;
    const status = await checkExistsFlightSchedule(id);
    if (status) {
      const flightSchedule = await FlightSchedule.destroy({ where: { id } });
      return res.json({
        data: "Flight schedule deleted successfully",
        status: true,
      });
    } else {
      return next(createError(422, "Error flight schedule does not exists"));
    }
  } catch (error) {
    return next(
      createError(500, "Error while deleting flight schedule " + error)
    );
  }
};

const getFlightScheduleById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const status = await checkExistsFlightSchedule(id);
    if (status) {
      const flightSchedule = await findFlightScheduleById(id);

      let flight_schedule_data = JSON.parse(JSON.stringify(flightSchedule[0]));
      flight_schedule_data.source_name =
        flight_schedule_data.source_name?.city_name;
      flight_schedule_data.destination_name =
        flight_schedule_data.destination_name?.city_name;

      return res.json({ data: flight_schedule_data, status: true });
    } else {
      return next(createError(422, "Error flight schedule does not exists"));
    }
  } catch (error) {
    return next(
      createError(500, "Error while fetching flight schedule details " + error)
    );
  }
};

const getAllFlightSchedules = async (req, res, next) => {
  try {
    const resultPerPage = 4;
    const apiFeatures = new Apifeatures(FlightSchedule, req.query)
      .priceFilter()
      .timeFilter()
      .TicketFilter()
      .pagination(resultPerPage)
      .filter();

    let flightScheduleWithflights = await findAllFlightSchedules({
      queryCopy: apiFeatures.queryCopy,
      priceQuery: apiFeatures.priceQuery,
      timeQuery: apiFeatures.timeQuery,
      ticketQuery: apiFeatures.ticketQuery,
      skip: apiFeatures.skip,
      resultPerPage,
    });

    res.status(200).json({
      flightScheduleWithflights,
      success: true,
      filteredPerCount: flightScheduleWithflights.rows.length,
      resultPerPage,
    });
  } catch (error) {
    return next(createError(500, error));
  }
};

const getFlightSchedules = async (req, res, next) => {
  try {
    const apiFeatures = new Apifeatures(FlightSchedule, req.query)
      .priceFilter()
      .filter();
    let flightSchedules = await apiFeatures.query;

    res.status(200).json({ flightSchedules });
  } catch (err) {
    next(err);
  }
};

const createFlightScheduleFromArray = async (req, res, next) => {
  try {
    let scheduleData = req.body;

    if (scheduleData.length == 0) {
      return next(createError(422, "Error no flight schedule data entered"));
    }

    for (let i = 0; i < scheduleData.length; i++) {
      try {
        const flightId = scheduleData[i]?.flight_id;
        const source = scheduleData[i]?.source;
        const destination = scheduleData[i]?.destination;
        const arrivalTime = scheduleData[i]?.arrival_time;
        const departureTime = scheduleData[i]?.departure_time;
        const totalAvailableSeats = scheduleData[i]?.total_available_seats;
        const pricePerSeat = scheduleData[i]?.price_per_seat;

        const flightExistsStatus = await checkExistsFlight(flightId);
        const sourceCityStatus = await checkExistsCity(source);
        const destinationCityStatus = await checkExistsCity(destination);

        if (!flightExistsStatus) {
          return next(createError(422, "Error flight does not exists"));
        }

        if (!sourceCityStatus) {
          return next(createError(422, "Error source city does not exists"));
        }

        if (!destinationCityStatus) {
          return next(
            createError(422, "Error destination city does not exists")
          );
        }

        if (source == destination) {
          return next(
            createError(422, "Error source and destination city cannot be same")
          );
        }

        if (arrivalTime == departureTime) {
          return next(
            createError(
              422,
              "Error arrival time and departure time cannot be same"
            )
          );
        }

        if (departureTime > arrivalTime) {
          return next(
            createError(
              422,
              "Error departure time of source city cannot be greater than arrival time of destination city"
            )
          );
        }

        if (totalAvailableSeats == 0) {
          return next(
            createError(422, "Error total available seat cannot be zero")
          );
        }

        if (totalAvailableSeats < 0) {
          return next(
            createError(422, "Error total available seats cannot be negative")
          );
        }

        if (pricePerSeat == 0) {
          return next(createError(422, "Error price per seat cannot be zero"));
        }

        if (pricePerSeat < 0) {
          return next(
            createError(422, "Error price per seat cannot be less than zero")
          );
        }

        const flightSchedule = await FlightSchedule.create(scheduleData[i]);
        await flightSchedule.save();
      } catch (error) {
        throw error;
      }
    }

    return res.json({
      data: "Flight schedule created successfully",
      status: true,
    });
  } catch (error) {
    return next(
      createError(500, "Error while creating flight schedule " + error)
    );
  }
};

const updateFlightScheduleFromArray = async (req, res, next) => {
  try {
    let scheduleData = req.body;

    if (scheduleData.length == 0) {
      return next(createError(422, "Error no flight schedule data entered"));
    }

    for (let i = 0; i < scheduleData.length; i++) {
      try {
        const flightScheduleId = scheduleData[i]?.id;
        const flightId = scheduleData[i]?.transportId;
        const source = scheduleData[i]?.source;
        const destination = scheduleData[i]?.destination;
        const arrivalTime = scheduleData[i]?.arrival_time;
        const departureTime = scheduleData[i]?.departure_time;
        const totalAvailableSeats = scheduleData[i]?.total_available_seats;
        const pricePerSeat = scheduleData[i]?.price_per_seat;

        const flightExistsStatus = await checkExistsFlight(flightId);
        const flightScheduleStatus = await checkExistsFlightSchedule(
          flightScheduleId
        );
        const sourceCityStatus = await checkExistsCity(source);
        const destinationCityStatus = await checkExistsCity(destination);

        if (!sourceCityStatus) {
          return next(createError(422, "Error source city does not exists"));
        }

        if (!destinationCityStatus) {
          return next(
            createError(422, "Error destination city does not exists")
          );
        }

        if (source == destination) {
          return next(
            createError(422, "Error source and destination city cannot be same")
          );
        }

        if (arrivalTime == departureTime) {
          return next(
            createError(
              422,
              "Error arrival time and departure time cannot be same"
            )
          );
        }

        if (departureTime > arrivalTime) {
          return next(
            createError(
              422,
              "Error departure time of source city cannot be greater than arrival time of destination city"
            )
          );
        }

        if (totalAvailableSeats < 0) {
          return next(
            createError(422, "Error total available seats cannot be negative")
          );
        }

        if (pricePerSeat == 0) {
          return next(createError(422, "Error price per seat cannot be zero"));
        }

        if (pricePerSeat < 0) {
          return next(
            createError(422, "Error price per seat cannot be less than zero")
          );
        }

        if (!flightScheduleStatus) {
          if (!flightExistsStatus) {
            return next(createError(422, "Error flight does not exists"));
          }

          const newFlightScheduleData = {
            flight_id: flightId,
            source: source,
            destination: destination,
            departure_time: departureTime,
            arrival_time: arrivalTime,
            total_available_seats: totalAvailableSeats,
            price_per_seat: pricePerSeat,
          };

          if (totalAvailableSeats == 0) {
            return next(
              createError(422, "Error total available seat cannot be zero")
            );
          }

          const flightScheduleDetail = await FlightSchedule.create(
            newFlightScheduleData
          );
          await flightScheduleDetail.save();
        } else {
          const flightSchedule = await FlightSchedule.update(scheduleData[i], {
            where: { id: flightScheduleId },
          });
        }
      } catch (error) {
        throw error;
      }
    }

    return res.json({
      data: "Flight schedule updated successfully",
      status: true,
    });
  } catch (error) {
    return next(
      createError(500, "Error while updating flight schedule " + error)
    );
  }
};

const getAllFlightSchedulesByFlightId = async (req, res, next) => {
  try {
    const flightId = req.params.id;
    const flightSchedules = await findAllFlightSchedulesByFlightId(flightId);
    return res.json({ data: flightSchedules, status: true });
  } catch (error) {
    return next(createError(500, "Error while fetching flight schedules"));
  }
};

module.exports = {
  createFlightSchedule,
  updateFlightSchedule,
  deleteFlightSchedule,
  getFlightScheduleById,
  getFlightSchedules,
  getAllFlightSchedules,
  createFlightScheduleFromArray,
  getAllFlightSchedulesByFlightId,
  updateFlightScheduleFromArray,
};
