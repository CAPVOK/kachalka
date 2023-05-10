import { Route, Routes } from "react-router";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import userReducer from "./api/UserSlice"
import "./App.css";

import { AuthPage } from "./pages/AuthPage";
import { NotFoundPage } from "./pages/NotFoundPage";

import { NavAdmin } from "./components/NavAdmin";
import { ClientsPage } from "./pages/admins/ClientsPage";
import { TrainersPage } from "./pages/admins/TrainersPage";
import { CardsPage } from "./pages/admins/CardsPage";
import { InventoryPage } from "./pages/admins/InventoryPage";
import { CategoriesPage } from "./pages/admins/CategoriesPage";
import {LessonsPage } from "./pages/admins/LessonsPage";


function App() {

  const store = configureStore({
    reducer: {
      user: userReducer,
    },
  })

  return (
    <>
      <Provider store={store}>
        <Routes>
          <Route exact path='/' element={<AuthPage />} />

          <Route path="/admins" element={<NavAdmin />}>
            <Route path='main' element={<ClientsPage />} />
            <Route path='trainers' element={<TrainersPage />} />
            <Route path='cards' element={<CardsPage />} />
            <Route path='inventory' element={<InventoryPage />} />
            <Route path='categories' element={<CategoriesPage />} />
            <Route path='lessons' element={<LessonsPage />} />
          </Route>

          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </Provider>
    </>
  );
}

export default App;
