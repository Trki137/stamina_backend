const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Stamina",
  password: "bazepodataka",
  port: 5432,
});

const sql_create_users_table = `
    CREATE TABLE USERS
    (
        username    VARCHAR(40)  NOT NULL,
        email       VARCHAR(50)  NOT NULL,
        password    VARCHAR(100) NOT NULL,
        description VARCHAR(300),
        userId      SERIAL       NOT NULL,
        image       VARCHAR(50),
        PRIMARY KEY (userId),
        UNIQUE (username),
        UNIQUE (email)
    );
`;
const sql_create_activity_table = `
    CREATE TABLE ACTIVITY
    (
        activityId SERIAL      NOT NULL,
        name       VARCHAR(40) NOT NULL,
        PRIMARY KEY (activityId),
        UNIQUE (name)
    );
`;
const sql_create_workout_table = `
    CREATE TABLE WORKOUT
    (
        workoutId   SERIAL      NOT NULL,
        name        VARCHAR(40) NOT NULL,
        description VARCHAR(200),
        intensity   VARCHAR(20) NOT NULL,
        PRIMARY KEY (workoutId),
        UNIQUE (name)
    );
`;
const sql_create_muscle_group_table = `
    CREATE TABLE MUSCLE_GROUP
    (
        muscleId SERIAL      NOT NULL,
        name     VARCHAR(50) NOT NULL,
        body_side VARCHAR(15) NOT NULL,
        PRIMARY KEY (muscleId),
        UNIQUE (name)
    );
`;
const sql_create_equipment_table = `
    CREATE TABLE EQUIPMENT
    (
        equipmentId SERIAL      NOT NULL,
        name        VARCHAR(40) NOT NULL,
        PRIMARY KEY (equipmentId),
        UNIQUE (name)
    );
`;
const sql_create_training_table = `
    CREATE TABLE TRAINING
    (
        time         VARCHAR(30) NOT NULL,
        name         VARCHAR(40) NOT NULL,
        intensity    VARCHAR(20) NOT NULL,
        description  VARCHAR(300),
        trainingId   SERIAL      NOT NULL,
        avg_calories INT,
        PRIMARY KEY (trainingId),
        UNIQUE (name)
    );
`;
const sql_create_event_table = `
    CREATE TABLE EVENT
    (
        eventId     SERIAL       NOT NULL,
        date_time   TIMESTAMP    NOT NULL,
        name        VARCHAR(50)  NOT NULL,
        description VARCHAR(400) NOT NULL,
        userId      INT          NOT NULL,
        PRIMARY KEY (eventId),
        FOREIGN KEY (userId) REFERENCES USERS (userId)
    );
`;
const sql_create_challenge_table = `
    CREATE TABLE CHALLENGE
    (
        eventId   INT NOT NULL,
        workoutId INT,
        PRIMARY KEY (eventId),
        FOREIGN KEY (eventId) REFERENCES EVENT (eventId),
        FOREIGN KEY (workoutId) REFERENCES WORKOUT (workoutId)
    );
`;
const sql_create_city_table = `
    CREATE TABLE CITY
    (
        cityId SERIAL      NOT NULL,
        pbr    INT         NOT NULL,
        name   VARCHAR(40) NOT NULL,
        PRIMARY KEY (cityId),
        UNIQUE (pbr)
    );
`;
const sql_create_muscle_workout_target_table = `

    CREATE TABLE muscle_workout_target
    (
        workoutId INT NOT NULL,
        muscleId  INT NOT NULL,
        PRIMARY KEY (workoutId, muscleId),
        FOREIGN KEY (workoutId) REFERENCES WORKOUT (workoutId),
        FOREIGN KEY (muscleId) REFERENCES MUSCLE_GROUP (muscleId)
    );
`;
const sql_create_workout_equipment_table = `
    CREATE TABLE workout_equipment
    (
        workoutId   INT NOT NULL,
        equipmentId INT NOT NULL,
        PRIMARY KEY (workoutId, equipmentId),
        FOREIGN KEY (workoutId) REFERENCES WORKOUT (workoutId),
        FOREIGN KEY (equipmentId) REFERENCES EQUIPMENT (equipmentId)
    );
`;
const sql_create_training_plan_table = `
    CREATE TABLE training_plan
    (
        workoutId  INT NOT NULL,
        trainingId INT NOT NULL,
        PRIMARY KEY (workoutId, trainingId),
        FOREIGN KEY (workoutId) REFERENCES WORKOUT (workoutId),
        FOREIGN KEY (trainingId) REFERENCES TRAINING (trainingId)
    );
`;
const sql_create_accepted_challenge_table = `
    CREATE TABLE accepted_challenge
    (
        finished CHAR(1) NOT NULL,
        userId   INT     NOT NULL,
        eventId  INT     NOT NULL,
        PRIMARY KEY (userId, eventId),
        FOREIGN KEY (userId) REFERENCES USERS (userId),
        FOREIGN KEY (eventId) REFERENCES CHALLENGE (eventId)
    );

`;
const sql_create_follows_table = `
    CREATE TABLE follows
    (
        userId        INT NOT NULL,
        follow_userId INT NOT NULL,
        PRIMARY KEY (userId, follow_userId),
        FOREIGN KEY (userId) REFERENCES USERS (userId),
        FOREIGN KEY (follow_userId) REFERENCES USERS (userId)
    );
`;
const sql_create_exercise_data_table = `
    CREATE TABLE EXERCISE_DATA
    (
        exerciseDataId  SERIAL      NOT NULL,
        time            VARCHAR(30) NOT NULL,
        calories        INT,
        avg_hearth_rate INT,
        userId          INT         NOT NULL,
        activityId      INT         NOT NULL,
        PRIMARY KEY (exerciseDataId),
        UNIQUE (exerciseDataId, userId),
        FOREIGN KEY (userId) REFERENCES USERS (userId),
        FOREIGN KEY (activityId) REFERENCES ACTIVITY (activityId)
    );
`;
const sql_create_address_table = `
    CREATE TABLE ADDRESS
    (
        addressId   SERIAL      NOT NULL,
        street      VARCHAR(50) NOT NULL,
        home_number VARCHAR(10) NOT NULL,
        cityId      INT         NOT NULL,
        PRIMARY KEY (addressId),
        FOREIGN KEY (cityId) REFERENCES CITY (cityId)
    );
`;
const sql_create_group_event_table = `
    CREATE TABLE GROUP_EVENT
    (
        max_space INT NOT NULL,
        eventId   INT NOT NULL,
        addressId INT NOT NULL,
        PRIMARY KEY (eventId),
        FOREIGN KEY (eventId) REFERENCES EVENT (eventId),
        FOREIGN KEY (addressId) REFERENCES ADDRESS (addressId)
    );
`;
const sql_create_joined_event_table = `
    CREATE TABLE joined_event
    (
        joined_event_id INT NOT NULL,
        userId          INT NOT NULL,
        eventId         INT NOT NULL,
        PRIMARY KEY (joined_event_id),
        UNIQUE (userId, eventId),
        FOREIGN KEY (userId) REFERENCES USERS (userId),
        FOREIGN KEY (eventId) REFERENCES GROUP_EVENT (eventId)
    );
`;

const tables = [
  sql_create_users_table,
  sql_create_activity_table,
  sql_create_workout_table,
  sql_create_muscle_group_table,
  sql_create_equipment_table,
  sql_create_training_table,
  sql_create_event_table,
  sql_create_challenge_table,
  sql_create_city_table,
  sql_create_muscle_workout_target_table,
  sql_create_workout_equipment_table,
  sql_create_training_plan_table,
  sql_create_accepted_challenge_table,
  sql_create_follows_table,
  sql_create_exercise_data_table,
  sql_create_address_table,
  sql_create_group_event_table,
  sql_create_joined_event_table,
];

const table_names = [
  "users",
  "activity",
  "workout",
  "muscle_group",
  "equipment",
  "training",
  "event",
  "challenge",
  "city",
  "muscle_workout_target",
  "workout_equipment",
  "training_plan",
  "accepted_challenge",
  "follows",
  "exercise_data",
  "address",
  "group_event",
  "joined_event",
];

(async () => {
  console.log("Creating tables.");
  for (let i = 0; i < tables.length; i++) {
    console.log(`Creating table ${table_names[i]}.`);
    try {
      await pool.query(tables[i], []);
      console.log(`Created table ${table_names[i]}.`);
    } catch (e) {
      console.log(`Error creating table ${table_names[i]}.`);
      return console.log(e.message);
    }
  }

  await pool.end();
})();
