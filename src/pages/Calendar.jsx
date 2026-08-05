import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../pages/analytics.css";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];



export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 7));
    const previousMonth = () => {
        setCurrentDate(
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1
          )
        );
      };
      
      const nextMonth = () => {
        setCurrentDate(
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            1
          )
        );
      };
      const firstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      
      const totalDays = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate();
      
      // Convert Sunday=0 to Monday=0
      const startDay = (firstDay.getDay() + 6) % 7;
      
      const calendarDays = [];
      
      // Empty boxes before the 1st
      for (let i = 0; i < startDay; i++) {
        calendarDays.push("");
      }
      
      // Actual days
      for (let i = 1; i <= totalDays; i++) {
        calendarDays.push(i);
      }
  return (
    <div className="dashboard">

      <Sidebar />

      <main className="dashboard-content">

        <Header />

        <div className="analytics-page">

          <div className="analytics-header">

            <small>GOLPO FOOD COURT</small>

            <h1>Audit Calendar</h1>

            <p>
              View all scheduled and completed audits by date.
            </p>

          </div>

          <div className="calendar-card">

            
            <div className="calendar-top">

<button onClick={previousMonth}>
  {"<"}
</button>

<h2>
  {currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })}
</h2>

<button onClick={nextMonth}>
  {">"}
</button>

</div>
            

            <div className="calendar-grid">

              {weekDays.map((day) => (
                <div className="calendar-heading" key={day}>
                  {day}
                </div>
              ))}

{calendarDays.map((day, index) => (

                <div className="calendar-day" key={index}>

                  {day && (
                    <>
                      <span className="day-number">{day}</span>

                      <div className="audit-dot green"></div>

                    </>
                  )}

                </div>

              ))}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}