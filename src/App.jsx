import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Header from "./Components/Header";
import SignUp from "./Components/Sign_up";
import LogIn from "./Components/Log_in";
import Sidebar from "./Components/Sidebar";
import Home from "./Components/Home";
import AdvanceSearch from "./Components/Advance_search";
import Athlete from "./Components/Athlete";
import Events from "./Components/Events";
import Gender from "./Components/Gender";
import Results from "./Components/Results";
import EventTasks from "./Components/Event_tasks";
import Competition from "./Components/Competition";
import TimeRange from "./Components/Time_range";
import Upload from "./Components/Upload";
import Event from "./Components/Event";
import Performance from "./Components/Performance";
import Task from "./Components/Task";
import Time from "./Components/Time";
import Athletes from "./Components/Athletes";

function App() {
  const Wrap = ({ children }) => <Sidebar child={children} />;
  const Wrap2 = ({ children }) => <AdvanceSearch child={children} />;

  const routes = [
    {
      path: "/",
      element: (
        <Wrap>
          <Home />
        </Wrap>
      ),
    },
    {
      path: "/header",
      element: (
        <Wrap>
          <Header />
        </Wrap>
      ),
    },
    {
      path: "/athletes",
      element: (
        <Wrap>
          <Athletes />
        </Wrap>
      ),
    },
    {
      path: "/signup",
      element: <SignUp />,
    },
    {
      path: "/login",
      element: <LogIn />,
    },
    {
      path: "/advance",
      element: <AdvanceSearch />,
    },
    {
      path: "/events",
      element: (
        <Wrap>
          <Events />
        </Wrap>
      ),
    },
    {
      path: "/gender",
      element: (
        <Wrap>
          <Gender />
        </Wrap>
      ),
    },
    {
      path: "/timeranges",
      element: (
        <Wrap>
          <TimeRange />
        </Wrap>
      ),
    },
    {
      path: "/results",
      element: (
        <Wrap>
          <Results />
        </Wrap>
      ),
    },
    {
      path: "/eventtasks",
      element: (
        <Wrap>
          <EventTasks />
        </Wrap>
      ),
    },
    {
      path: "/competition",
      element: (
        <Wrap>
          <Competition />
        </Wrap>
      ),
    },
    {
      path: "/upload",
      element: (
        <Wrap>
          <Upload />
        </Wrap>
      ),
    },
    {
      path: "/athlete",
      element: (
        <Wrap2>
          <Athlete />
        </Wrap2>
      ),
    },
    {
      path: "/event",
      element: (
        <Wrap2>
          <Event />
        </Wrap2>
      ),
    },
    {
      path: "/performance",
      element: (
        <Wrap2>
          <Performance />
        </Wrap2>
      ),
    },
    {
      path: "/task",
      element: (
        <Wrap2>
          <Task />
        </Wrap2>
      ),
    },
    {
      path: "/time",
      element: (
        <Wrap2>
          <Time />
        </Wrap2>
      ),
    },
  ];

  const router = createBrowserRouter(routes, {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  });
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
