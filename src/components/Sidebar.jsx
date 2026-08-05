import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  BarChart3,
  Trophy,
  Settings,
  CheckSquare
} from "lucide-react";

export default function Sidebar() {

  const menu = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      link: "/"
    },
    {
      name: "New Audit",
      icon: ClipboardList,
      link: "/new"
    },
    {
      name: "Calendar",
      icon: CalendarDays,
      link: "/calendar"
    },
    {
      name: "Analytics",
      icon: BarChart3,
      link: "/analytics"
    },
    {
      name: "Leaderboard",
      icon: Trophy,
      link: "/leaderboards"
    }
  ];

  return (

    <aside className="sidebar">

<div className="logo">

<div className="logoIcon">
  <CheckSquare size={28}/>
</div>

<div className="logoText">
  <h2>Golpo Food Court</h2>
  <p>Operations Command Centre</p>
</div>

</div>
          

      <nav>

        {menu.map(item=>{

          const Icon=item.icon;

          return(

            <NavLink
              key={item.name}
              to={item.link}
              className={({isActive}) =>
                isActive ? "menu active":"menu"
              }
            >

              <Icon size={19}/>

              <span>{item.name}</span>

            </NavLink>

          )

        })}

      </nav>

<div className="sidebarFooter">

<div className="cloud">

  <div className="dot"></div>

  <span>Cloud Connected</span>

</div>

<div className="version">

  Golpo Operations v2.0

</div>

</div>

    </aside>

  )

}