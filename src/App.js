import React, { useState } from "react";

function App() {
  const [activities, setActivities] = useState(() => {
    const savedData = localStorage.getItem("activities");
    return savedData ? JSON.parse(savedData) : [];
  });

  const [newActivity, setNewActivity] = useState({
    date: new Date().toISOString().split("T")[0],
    start: "",
    end: "",
    activity: "Flight",
  });

  const [targetDate, setTargetDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const addActivity = () => {
    if (
      newActivity.date &&
      newActivity.start &&
      newActivity.end &&
      newActivity.activity
    ) {
      const updatedActivities = [...activities, newActivity].sort((a, b) => {
        const dateA = new Date(a.date + "T" + a.start);
        const dateB = new Date(b.date + "T" + a.start);
        return dateB - dateA;
      });

      setActivities(updatedActivities); // ✅ Now activities are stored in state
      localStorage.setItem("activities", JSON.stringify(updatedActivities)); // ✅ Save to local storage

      setNewActivity({
        date: new Date().toISOString().split("T")[0],
        start: "",
        end: "",
        activity: "Flight",
      });
    }
  };

  const deleteActivity = (index) => {
    setActivities(
      activities
        .filter((_, i) => i !== index)
        .sort((a, b) => {
          const dateA = new Date(a.date + "T" + a.start);
          const dateB = new Date(b.date + "T" + a.start);
          return dateB - dateA;
        })
    );
  };

  const calculateFlightHours = () => {
    return activities
      .filter((a) => a.date === targetDate && a.activity === "Flight")
      .map((a) => {
        const startTime = new Date(`${a.date}T${a.start}`);
        const endTime = new Date(`${a.date}T${a.end}`);
        return (endTime - startTime) / (1000 * 60 * 60); // Flight hours
      })
      .reduce((sum, hours) => sum + hours, 0);
  };

  const calculateRestHours = () => {
    // Get the previous day's last end time and the current day's first start time
    const activitiesOnTargetDate = activities.filter(
      (a) => a.date === targetDate
    );
    const previousDayActivities = activities.filter(
      (a) => a.date === getPreviousDate(targetDate)
    );

    if (
      previousDayActivities.length === 0 ||
      activitiesOnTargetDate.length === 0
    ) {
      return 0;
    }

    const previousDayEndTime = new Date(
      `${getPreviousDate(targetDate)}T${
        previousDayActivities[previousDayActivities.length - 1].end
      }`
    );
    const targetStartTime = new Date(
      `${targetDate}T${activitiesOnTargetDate[0].start}`
    );

    return (targetStartTime - previousDayEndTime) / (1000 * 60 * 60); // Rest hours
  };

  const calculateContactHours = () => {
    return activities
      .filter((a) => a.date === targetDate) // Include all activities, not just Flight
      .map((a) => {
        const startTime = new Date(`${a.date}T${a.start}`);
        const endTime = new Date(`${a.date}T${a.end}`);
        return (endTime - startTime) / (1000 * 60 * 60); // Contact hours
      })
      .reduce((sum, hours) => sum + hours, 0);
  };

  const calculateConsecutiveDays = () => {
    let count = 0;
    let currentDate = targetDate;

    while (activities.some((a) => a.date === currentDate)) {
      count++;
      currentDate = getPreviousDate(currentDate); // Move to the previous day
    }

    return count;
  };

  const calculateDutyDay = () => {
    // Filter activities for the target date
    const activitiesOnTargetDate = activities.filter(
      (a) => a.date === targetDate
    );

    // Ensure there are activities for the target date
    if (activitiesOnTargetDate.length === 0) {
      return 0; // No activities, return 0 hours for duty day
    }

    // Calculate the first start time and last end time
    const firstStartTime = new Date(
      `${targetDate}T${activitiesOnTargetDate[0].start}`
    );
    const lastEndTime = new Date(
      `${targetDate}T${
        activitiesOnTargetDate[activitiesOnTargetDate.length - 1].end
      }`
    );

    // Calculate the duty day in hours
    return (lastEndTime - firstStartTime) / (1000 * 60 * 60); // Duty day in hours
  };

  const getPreviousDate = (date) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    return newDate.toISOString().split("T")[0]; // Return date in YYYY-MM-DD format
  };

  const flightHours = calculateFlightHours();
  const restHours = calculateRestHours();
  const contactHours = calculateContactHours();
  const consecutiveDays = calculateConsecutiveDays();
  const dutyDay = calculateDutyDay();

  // Style adjustments for color based on hours
  const flightBoxStyle =
    flightHours > 8 ? { backgroundColor: "darkred", color: "white" } : {};
  const restBoxStyle =
    restHours > 0 && restHours < 10
      ? { backgroundColor: "darkred", color: "white" }
      : {};
  const consecutiveBoxStyle =
    consecutiveDays > 16 ? { backgroundColor: "darkred", color: "white" } : {};
  const dutyDayBoxStyle =
    dutyDay > 16
      ? { backgroundColor: "darkred", color: "white", fontWeight: "bold" }
      : {};

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>SafeHoursAlpha</h1>
      <div style={{ marginBottom: "20px" }}>
        <input
          id="target-date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          style={{
            fontSize: "22px",
            padding: "12px",
            width: "250px",
            textAlign: "center",
          }}
        />
        <div
          style={{ marginTop: "5px", textAlign: "center", fontSize: "14px" }}
        >
          <label htmlFor="target-date">Target Date</label>
        </div>

        <h3>Add Activity</h3>
        <label>Date:</label>
        <input
          type="date"
          value={newActivity.date}
          onChange={(e) =>
            setNewActivity({ ...newActivity, date: e.target.value })
          }
          style={{ fontSize: "18px", padding: "8px", width: "250px" }}
        />
        <br />
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <div>
            <label>Start:</label>
            <input
              type="time"
              value={newActivity.start}
              onChange={(e) =>
                setNewActivity({ ...newActivity, start: e.target.value })
              }
              style={{ fontSize: "14px", padding: "10px", width: "120px" }}
            />
          </div>
          <div>
            <label>End:</label>
            <input
              type="time"
              value={newActivity.end}
              onChange={(e) =>
                setNewActivity({ ...newActivity, end: e.target.value })
              }
              style={{ fontSize: "18px", padding: "10px", width: "120px" }}
            />
          </div>
        </div>
        <label>Activity:</label>
        <select
          value={newActivity.activity}
          onChange={(e) =>
            setNewActivity({ ...newActivity, activity: e.target.value })
          }
          style={{ fontSize: "18px", padding: "10px", width: "250px" }}
        >
          <option value="Flight">Flight</option>
          <option value="Pre-Post">Pre-Post</option>
          <option value="Ground">Ground</option>
          <option value="Class">Class</option>
          <option value="Other">Other</option>
        </select>
        <br />
        <button
          onClick={addActivity}
          style={{
            marginTop: "10px",
            padding: "8px 30px", // Thinner in height and longer in width
            fontSize: "18px",
          }}
        >
          Add
        </button>
      </div>

      {/* Table of Activities */}
      <div style={{ marginTop: "30px" }}>
        <table
          border="1"
          style={{ width: "80%", margin: "auto", marginTop: "20px" }}
        >
          <thead>
            <tr>
              <th>Date</th>
              <th>Start</th>
              <th>End</th>
              <th>Activity</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{entry.start}</td>
                <td>{entry.end}</td>
                <td>{entry.activity}</td>
                <td
                  style={{ textAlign: "center", cursor: "pointer" }}
                  onClick={() => deleteActivity(index)}
                >
                  🗑️
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Display boxes */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <div style={{ ...boxStyle, ...flightBoxStyle }}>
          <h3>
            FLIGHT INSTRUCTION<div> </div> {flightHours.toFixed(2)} hrs
          </h3>
        </div>
        <div style={{ ...boxStyle, ...restBoxStyle }}>
          <h3>
            REST HOURS<div> </div> {restHours.toFixed(2)} hrs
          </h3>
        </div>
        <div style={boxStyle}>
          <h3>
            CONTACT HOURS<div> </div> {contactHours.toFixed(2)} hrs
          </h3>
        </div>
        <div style={{ ...boxStyle, ...consecutiveBoxStyle }}>
          <h3>
            CONSECUTIVE DAYS<div> </div> {consecutiveDays} days
          </h3>
        </div>
        <div style={{ ...boxStyle, ...dutyDayBoxStyle }}>
          <h3>
            DUTY DAY<div> </div> {dutyDay.toFixed(2)} hrs
          </h3>
        </div>
      </div>
    </div>
  );
}

const boxStyle = {
  width: "250px",
  height: "50px", // Thin boxes
  backgroundColor: "#f0f0f0",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

export default App;
