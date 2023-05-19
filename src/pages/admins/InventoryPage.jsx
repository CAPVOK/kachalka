import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import Modal from "../../components/Modal";

function InventoryPage() {
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModalButton, setShowModalButton] = useState(true);
    const [showNewButton, setShowNewButton] = useState(false);
    const [cards, setCards] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        description: '',
        categoryid: '',
        roomid: '',
    });

    console.log("inventory");

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
        if (formData.roomid && formData.description && formData.categoryid) {
            invoke("edit_anything", { table: 'inventory', data: `description='${formData.description}', categoryid='${formData.categoryid}', roomid='${formData.roomid}'`, condition: `where id='${formData.id}'` })
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

    const handlePrevDelete = (user) => {
        setMessage(`Вы уверены, что хотите удалить инвентарь ${user.description} ?`);
        setShowModalButton(true);
        setShowModalDelete(true);
    }

    const handleDelete = () => {
        invoke("delete_anything", { table: "inventory", condition: `where id = '${selectedUser.id}'` })
            .then((res) => {
                setMessage(res);
                setShowModalButton(false);
                getCards();
            })
            .catch((err) => { setMessage(err) })
    };

    const handlePrevNew = () => {
        setMessage("Заполните все данные");
        setFormData({
            id: '',
            description: '',
            categoryid: `${categories[0].id}`,
            roomid: `${rooms[0].id}`,
        })
        setShowNewButton(true);
        setShowModalEdit(true);
    };

    const handleNew = () => {
        if (formData.description && formData.categoryid && formData.roomid) {
            invoke("new_anything", { data: `inventory ( description, categoryid, roomid ) VALUES ('${formData.description}', '${formData.categoryid}', '${formData.roomid}')` })
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

    const handlePrint = () => {
        /*  */
    }

    const getCards = () => {
        invoke("get_inventory")
            .then((res) => {
                setCards(res);
            })
            .catch((err) => { console.log(err) });
    };

    useEffect(() => {
        getCards();
        invoke("get_rooms").then((res) => { setRooms(res) }).catch((err) => { console.log(err) });
        invoke("get_categories").then((res) => { setCategories(res) }).catch((err) => { console.log(err) });
    }, []);

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
                        <label className="text-gray-500 w-32">Описание</label>
                        <input className="p-1 hover:bg-blue-600/10" type="text" value={formData.description} name="description" onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Помещение</label>
                        <select value={formData.roomid} onChange={handleInputChange} name="roomid" >
                            {rooms.map((room) =>
                                <option key={room.id} value={room.id}>{room.name}</option>
                            )}
                        </select>
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Категория</label>
                        <select value={formData.categoryid} onChange={handleInputChange} name="categoryid" >
                            {categories.map((category) =>
                                <option key={category.id} value={category.id}>{category.name}</option>
                            )}
                        </select>
                        {/* <input className="p-1 hover:bg-blue-600/10" type="text" value={formData.categoryid} name="categoryid" onChange={handleInputChange} /> */}
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
                <div className="w-full flex flex-row pb-4 gap-4">
                    <button onClick={handlePrevNew} className="bg-blue-600 rounded-lg h-min p-2 text-white transition ease-in-out hover:scale-105 active:scale-110">Добавить</button>
                    <button onClick={handlePrint} className="bg-amber-600 rounded-lg h-min p-2 text-white transition ease-in-out hover:scale-105 active:scale-110">Печать</button>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Помещение</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cards.map((card) => (
                            <tr key={card.id} className="hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap">{card.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{card.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{rooms.length > 0 ? rooms.find((room) => room.id === card.roomid).name : card.roomid}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{categories.length > 0 ? categories.find((category) => category.id === card.categoryid).name : card.categoryid}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-2" onClick={() => { setSelectedUser(card); handlePrevEdit(card) }}>
                                        Edit
                                    </button>
                                    <button className="text-red-600 hover:text-red-900" onClick={() => { setSelectedUser(card); handlePrevDelete(card) }}>
                                        Delete
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
export { InventoryPage };