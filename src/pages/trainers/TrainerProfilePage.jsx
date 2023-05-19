import { Link } from "react-router-dom"
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import Modal from "../../components/Modal";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import trump from "../../images/trump.jpg";
import billi from "../../images/billiAngel.jpg";

function TrainerProfilePage() {
    const [user, setUser] = useState();
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [message, setMessage] = useState('');
    const [showModalButton, setShowModalButton] = useState(true);
    const [cards, setCards] = useState([]);

    console.log("trainers")

    const navigate = useNavigate();
    const ClientId = useSelector((state) => state.user.user.id);
    console.log(`${ClientId} - clientid`)

    const handleCloseModal = () => {
        setShowModalDelete(false);
        setMessage('');
    };

    const handlePrevDelete = () => {
        setMessage(`Вы уверены, что хотите покинуть наш GYM ?`);
        setShowModalButton(true);
        setShowModalDelete(true);
    }

    const handleDelete = () => {
        invoke("delete_anything", { table: "trainers", condition: `where id = '${user.id}'` })
            .then((res) => {
                setMessage(res);
                setShowModalButton(false);
                navigate(`/`);
            })
            .catch((err) => { setMessage(err) })
    };

    const getClient = () => {
        invoke("get_all_users", { user_type: "trainers", condition: `where id=${ClientId}` })
            .then((res) => {
                setUser(res[0]);
                console.log(res[0]);
            }).catch((err) => console.log(err));
    };

    useEffect(() => {
        getClient();
        invoke("get_cards")
            .then((res) => {
                setCards(res);
            })
            .catch((err) => { console.log(err) });
    }, [])

    return (<>
        <div className="w-full h-full p-8 text-black  flex flex-row">
            {showModalDelete && <Modal onClose={handleCloseModal} >
                <div className="text-xl p-4">{message}</div>
                <img src={billi} alt="billy" />
                {showModalButton && <div className="h-36 flex flex-row items-center justify-center">
                    <button onClick={handleDelete} className="bg-red-500 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Да!</button>
                </div>}
            </Modal>}
            <div className="w-12/12 h-full mx-auto my-8 flex flex-col">
                {user && <div className="text-3xl mb-8">Здравствуйте, {user.surname} {user.name}!</div>}
                {user && <div className="w-full flex flex-col pb-4 gap-8">
                    <div className="flex flex-row justify-start gap-4 text-xl">
                        <div className="text-gray-500">
                            Возраст
                        </div>
                        <div>
                            {user.age}
                        </div>
                    </div>
                    <div className="flex flex-row justify-start gap-4 text-xl">
                        <div className="text-gray-500">
                            Специальность
                        </div>
                        <div>
                            {user.specialization}
                        </div>
                    </div>
                    <div className="flex flex-row justify-start gap-4 text-xl">
                        <div className="text-gray-500">
                            Телефон
                        </div>
                        <div>
                            {user.phone}
                        </div>
                    </div>
                </div>}
                <div className="flex flex-row justify-between">
                    <button onClick={handlePrevDelete} className="bg-red-500 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Удалить аккаунт</button>
                </div>
            </div>
            <img className="w-6/12" src={trump} alt="trump" />
        </div>
    </>)
}
export { TrainerProfilePage };