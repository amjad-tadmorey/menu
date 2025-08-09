import { Toaster } from "react-hot-toast"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Main from "./components/Main";
import TrackUI from "./components/TrackUI";

function App() {





  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Main />} />
        <Route path="/track" element={<TrackUI />} />
      </Routes>
      <Toaster
        gutter={12}
        containerStyle={{
          width: "100%",
          top: "35%",
          left: "50%",
          translate: "-50% -50%",
        }}
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 5000 },
          style: {
            fontSize: "1rem",
            width: "fit-content",
            padding: "8px 24px",
            backgroundColor: "white",
            color: "var(--color-grey-700)",
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App
