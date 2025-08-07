import { Toaster } from "react-hot-toast"
import OrderUI from "./components/OrderUI"

function App() {
  return (
    <>
      <OrderUI />
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
    </>
  )
}

export default App
