import { invoke } from "@tauri-apps/api/tauri";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from 'react-redux'
import { useSelector } from "react-redux";
import { saveUser } from "../api/UserSlice";

import logo from "../images/logo.png"
import kaban from '../images/kaban.jpg'

function AuthPage () {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [btnUser, setBtnUser] = useState(1); //выбор админ/тренер/клиент
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    function isValidPhoneNumber(phoneNumber) {
        return /^\+7\d{10}$/.test(phoneNumber) || /^(8\d{10})$/.test(phoneNumber);
    }

    function logIn () {
        navigate(`/admins/main`);
        if (!isValidPhoneNumber(phone) || password.length < 6) {
            setError('неверный номер или пароль');
            return;
        }

        let userType = btnUser === 1 ? "admins" : (btnUser ===2 ? "trainers" : "clients");
        
        invoke('get_user_by_phone', { phone: phone, password: password, user_type: userType})
        .then((ans)=>{
            dispatch(saveUser(ans));
            navigate(`/${ans.user_type}/main`);
            setError('');
        }).catch((err)=>setError(err));
    }

    const btnUserActive = 'bg-blue-600 text-white';
    const btnUserDefault = 'border-2 border-blue-600 hover:bg-blue-600 hover:text-white'

    return (<>
        <div className="w-full h-full text-center p-8 ">
            <img className="mx-auto w-10/12 md:w-8/12 object-cover" src={logo} alt="logo" />
            <div className="w-full flex flex-row justify-between">
                <div className="w-auto sm:w-6/12 p-4 mx-auto grid grid-cols-1 content-between space-y-2 border-2 border-black rounded-lg">
                    <div className="w-full flex flex-row justify-around">
                        <button onClick={()=>{setBtnUser(1)}} className={`py-2 px-4 shadow-md rounded-lg w-min ${btnUser === 1 ? btnUserActive : btnUserDefault}`}>Админ</button>
                        <button onClick={()=>{setBtnUser(2)}} className={`py-2 px-4 shadow-md rounded-lg w-min ${btnUser === 2 ? btnUserActive : btnUserDefault}`}>Тренер</button>
                        <button onClick={()=>{setBtnUser(3)}} className={`py-2 px-4 shadow-md rounded-lg w-min ${btnUser === 3 ? btnUserActive : btnUserDefault}`}>Клиент</button>
                    </div>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg p-2 border-2 border-black" placeholder="Введите номер телефона"/>
                    <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg p-2 border-2 border-black" placeholder="Введите пароль"/>
                    <div className="text-red-500 text-xl">{error}</div>
                    <button onClick={logIn} className="py-2 px-4 text-white rounded-lg bg-red-500 w-min mx-auto hover:bg-red-600">Войти</button>
                </div>
                <img className="hidden sm:block w-6/12 md:w-4/12" src={kaban} alt="kaban"/>
            </div>
            
        </div>
    </>)
}
export {AuthPage};