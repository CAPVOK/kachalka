import { Link } from "react-router-dom"
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import Modal from "../../components/Modal";

function RoomsPage() {
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModalButton, setShowModalButton] = useState(true);
    const [showNewButton, setShowNewButton] = useState(false);
    const [cards, setCards] = useState([]);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        capacity: "",
    });

    console.log("rooms");

    const handleCloseModal = () => {
        setShowModalDelete(false);
        setShowModalEdit(false);
        setMessage('');
    };

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleEdit = () => {
        if (formData.name && formData.capacity) {
            invoke("edit_anything", { table: 'rooms', data: `name='${formData.name}', capacity='${formData.capacity}'`, condition: `where id='${formData.id}'` })
                .then((res) => {
                    setMessage(res);
                    getCards();
                })
                .catch((err) => {
                    setMessage(err);
                });
        } else {
            setMessage("Заполните все поля");
        }
    };

    const handlePrevEdit = (user) => {
        setMessage("Измените данные");
        setFormData(user)
        setShowNewButton(false);
        setShowModalEdit(true);
    };


    const handleDelete = () => {
        invoke("delete_anything", { table: "rooms", condition: `where id = '${selectedUser.id}'` })
            .then((res) => {
                setMessage(res);
                setShowModalButton(false);
                getCards();
            })
            .catch((err) => { setMessage(err) })
    };


    const handleNew = () => {
        if (formData.name && formData.capacity) {
            invoke("new_anything", { data: `rooms ( name, capacity ) VALUES ('${formData.name}', '${formData.capacity}')` })
                .then((res) => {
                    setMessage(res);
                    getCards();
                })
                .catch((err) => {
                    setMessage(err);
                });
        } else {
            setMessage("Заполните все поля");
        }
    }

    const getCards = ()=>{
        invoke("get_rooms")
            .then((res) => {
                setCards(res);
            })
            .catch((err) => { console.log(err) });
    }

    useEffect(() => {
        getCards();
    }, [])

    return (<>
        <div className="w-full h-full p-8  text-black">
            {showModalDelete && <Modal onClose={handleCloseModal} >
                <div className="text-xl p-4">{message}</div>
                {showModalButton && <div className="h-36 flex flex-row items-center justify-center">
                    <button onClick={handleDelete} className="bg-red-500 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Delete</button>
                </div>}
            </Modal>}
            {showModalEdit && <Modal onClose={handleCloseModal} >
                <div className="text-xl p-4">{message}</div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-30">Название</label>
                        {formData.name}
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-30">Вместительность</label>
                        <input className="p-1 hover:bg-blue-600/10" type="text" value={formData.capacity} name="capacity" onChange={handleInputChange} />
                    </div>
                    <div>
                        <div className="h-36 flex flex-row items-center justify-center">
                            {!showNewButton ? <button onClick={handleEdit} className="bg-blue-600 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Изменить</button> :
                                <button onClick={handleNew} className="bg-blue-600 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Добавить</button>}
                        </div>
                    </div>
                </div>

            </Modal>}
            <div className="w-11/12 mx-auto mt-5">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Вместительность</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cards.map((card) => (
                            <tr key={card.id} className="hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap">{card.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{card.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{card.capacity}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-2" onClick={() => { setSelectedUser(card); handlePrevEdit(card) }}>
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </>)
}
export { RoomsPage };