import { Outlet, NavLink } from "react-router-dom";

function NavAdmin () {

    const noActive = 'flex font-bold p-4 rounded-lg border-2 border-red-500 hover:scale-105';
    const active = 'flex p-4 font-bold rounded-lg border-2 border-red-500 text-white bg-gradient-to-b from-white via-blue-600 to-red-500 scale-105';

    return(<>
        <header className="w-full p-4 flex flex-row justify-around">
            <NavLink to="main" className={({isActive})=>(isActive ? active : noActive)}>Клиенты</NavLink>
            <NavLink to="trainers" className={({isActive})=>(isActive ? active : noActive)}>Тренеры</NavLink>
            <NavLink to="lessons" className={({isActive})=>(isActive ? active : noActive)}>Занятия</NavLink>
            <NavLink to="inventory" className={({isActive})=>(isActive ? active : noActive)}>Инвентарь</NavLink>
            <NavLink to="cards" className={({isActive})=>(isActive ? active : noActive)}>Карты</NavLink>
            <NavLink to="categories" className={({isActive})=>(isActive ? active : noActive)}>Категории</NavLink>
            <NavLink to="/" className='flex p-4 font-bold rounded-lg border-2 border-red-500 text-white bg-red-500 scale-105'>Выйти</NavLink>
        </header>

        <Outlet/>
    
    </>)
}

export {NavAdmin}