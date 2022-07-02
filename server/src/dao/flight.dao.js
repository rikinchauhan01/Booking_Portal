const { Op } = require("sequelize");
const db = require("../models");
const City = db.cities;
const FlightDetail = db.flight_details;
const FlightSchedule = db.flight_schedule;

FlightDetail.hasMany(FlightSchedule, { foreignKey: "flight_id" });
FlightSchedule.belongsTo(FlightDetail, { foreignKey: "flight_id" });

City.hasMany(FlightSchedule, { foreignKey: "source" });
FlightSchedule.belongsTo(City, { as: "source_name", foreignKey: "source" });

City.hasMany(FlightSchedule, { foreignKey: "destination" });
FlightSchedule.belongsTo(City, {
  as: "destination_name",
  foreignKey: "destination",
});

const findFlightScheduleById = async (flightScheduleId) => {
  return FlightSchedule.findAll({
    where: { id: flightScheduleId },
    include: [
      {
        model: FlightDetail,
        attributes: ["id", "flight_name", "flight_type"],
      },
      {
        model: City,
        as: "source_name",
        attributes: ["city_name"],
      },
      {
        model: City,
        as: "destination_name",
        attributes: ["city_name"],
      },
    ],
  });
};

const findAllFlightSchedules = async ({
  queryCopy,
  priceQuery,
  timeQuery,
  ticketQuery,
  skip,
  resultPerPage,
}) => {
  const flights = FlightSchedule.findAndCountAll({
    offset: skip,
    limit: resultPerPage,
    where: { [Op.and]: [queryCopy, priceQuery, timeQuery, ticketQuery] },
    include: [
      {
        model: FlightDetail,
        attributes: ["id", "flight_name", "flight_type"],
      },
      {
        model: City,
        as: "source_name",
        attributes: ["city_name"],
      },
      {
        model: City,
        as: "destination_name",
        attributes: ["city_name"],
      },
    ],
  });
  return flights;
};

const findAllFlightSchedulesByFlightId = async (flightId) => {
  return FlightSchedule.findAndCountAll({
    where: { flight_id: flightId },
    include: [
      {
        model: FlightDetail,
        attributes: ["id", "flight_name", "flight_type"],
      },
      {
        model: City,
        as: "source_name",
        attributes: ["city_name"],
      },
      {
        model: City,
        as: "destination_name",
        attributes: ["city_name"],
      },
    ],
  });
};

module.exports = {
  findFlightScheduleById,
  findAllFlightSchedules,
  findAllFlightSchedulesByFlightId,
};
