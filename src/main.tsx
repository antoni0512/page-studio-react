import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import StudioEditor from "./StudioEditor";
import PublicBusinessPage from "./PublicPage";
import "./styles.css";

function App() { return window.location.pathname.startsWith("/p/") ? <PublicBusinessPage /> : <StudioEditor />; }
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
