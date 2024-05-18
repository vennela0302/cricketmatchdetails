const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;
app.use(express.json());

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
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
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

app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const playerDetails = req.body;
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
  UPDATE player_details SET player_name='${playerName}' WHERE player_id = ${playerId}`;
  await db.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

// API 4
app.get("/matches/:matchId/", async (req, res) => {
  const { matchId } = req.params;
  const getMatchDetailsQuery = `
    SELECT * FROM match_details WHERE match_id = ${matchId}`;
  const getMatchDetails = await db.get(getMatchDetailsQuery);
  res.send(dbObjectToServerRes(getMatchDetails));
});

// API 5
app.get("/players/:playerId/matches", async (req, res) => {
  const { playerId } = req.params;
  const getAllMatchesQuery = `
  SELECT match_id, match, year FROM player_match_score 
  NATURAL JOIN match_details 
  WHERE player_id = ${playerId}`;
  const getAllMatches = await db.all(getAllMatchesQuery);
  res.send(getAllMatches.map((eachPlayer) => dbObjectToServerRes(eachPlayer)));
});

// API 6
app.get("/matches/:matchId/players", async (req, res) => {
  const { matchId } = req.params;
  const getPlayersDetailsQuery = `
    SELECT player_id,player_name FROM player_details 
    NATURAL JOIN player_match_score 
    WHERE match_id = ${matchId}`;
  const getPlayerDet = await db.all(getPlayersDetailsQuery);
  res.send(getPlayerDet.map((eachPlayer) => dbObjectToServerRes(eachPlayer)));
});

// API 7
app.get("/players/:playerId/playerScores", async (req, res) => {
  const { playerId } = req.params;
  //   const getStatsQuery = `
  //     SELECT
  //     SUM(score),
  //     SUM(fours),
  //     SUM(sixes)
  //     FROM player_match_score
  //     WHERE player_id=${playerId}`;
  //   const stats = await db.get(getStatsQuery);
  const getStatsQuery = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes
     FROM player_details
    INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id=${playerId} `;
  const stats = await db.get(getStatsQuery);
  //   res.send({
  //     totalScore: stats["SUM(score)"],
  //     totalFours: stats["SUM(fours)"],
  //     totalSixes: stats["SUM(sixes)"],
  //   });
  res.send(stats);
});

module.exports = app;
