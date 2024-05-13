const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// player_details
// match_details
// player_match_score

// API 1

const dbObjectToServerRes = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

app.get("/players/", async (req, res) => {
  const getPlayersDetailsQuery = `
    SELECT * FROM player_details `;
  const getPlayersDetails = await db.all(getPlayersDetailsQuery);
  res.send(
    getPlayersDetails.map((eachPlayer) => dbObjectToServerRes(eachPlayer))
  );
});

// API 2

app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerQuery = `
    SELECT * FROM player_details WHERE player_id = ${playerId}`;
  const getPlayer = await db.get(getPlayerQuery);
  res.send(dbObjectToServerRes(getPlayer));
});

// API 3
// doubt
app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const playerDetails = req.body;
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
  UPDATE player_details SET player_name="${playerName}" WHERE player_id = ${playerId}`;
  await db.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

// API 4
