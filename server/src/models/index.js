const dbConfig = require("../../config/dbConfig");
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.DIALECT,
  logging: false,
  timezone: "+05:30",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log("Error: " + error);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.booking_records = require("./BookingRecordModel")(sequelize, DataTypes);
db.bus_details = require("./BusDetailModel")(sequelize, DataTypes);
db.bus_schedule = require("./BusScheduleModel")(sequelize, DataTypes);
db.cities = require("./CityModel")(sequelize, DataTypes);
db.flight_details = require("./FlightDetailsModel")(sequelize, DataTypes);
db.flight_schedule = require("./FlightScheduleModel")(sequelize, DataTypes);
db.passenger_details = require("./PassengerDetailsModel")(sequelize, DataTypes);
db.states = require("./StateModel")(sequelize, DataTypes);
db.train_details = require("./TrainDetailsModel")(sequelize, DataTypes);
db.train_schedules = require("./TrainScheduleModel")(sequelize, DataTypes);
db.users = require("./UsersModel")(sequelize, DataTypes);

db.sequelize.sync({ force: false }).then(() => {
  console.log("Resyncing done...");
});

module.exports = db;
