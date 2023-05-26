import { Link } from "react-router-dom"
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import Modal from "../../components/Modal";

function ClientsPage() {
    const [users, setUsers] = useState([]);
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
        surname: "",
        age: "",
        phone: "",
        card: "",
    });

    console.log("clients")

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

    const isValidAge = (age) => {
        return age >= 7 ? true : false;
    }

    function isValidPhoneNumber(phoneNumber) {
        return /^\+7\d{10}$/.test(phoneNumber) || /^(8\d{10})$/.test(phoneNumber);
    }

    const handleEdit = () => {
        if (formData.name && formData.surname && formData.age && formData.phone) {
            if (!isValidAge(formData.age)) {
                setMessage("Возраст не может быть меньше 7")
                return;
            }
            if (!isValidPhoneNumber(formData.phone)) {
                setMessage("Неверный формат номера телефона")
                return;
            }
            invoke("edit_anything", { table: 'clients', data: `name='${formData.name}', surname='${formData.surname}', age='${formData.age}', phone='${formData.phone}', card='${!formData.card ? cards[0].id : formData.card} '`, condition: `where id='${formData.id}'` })
                .then((res) => {
                    setMessage(res);
                    getClients();
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
        setMessage(`Вы уверены, что хотите удалить пользователя ${user.name} ${user.surname} ?`);
        setShowModalButton(true);
        setShowModalDelete(true);
    }

    const handleDelete = () => {
        invoke("delete_anything", { table: "clients", condition: `where id = '${selectedUser.id}'` })
            .then((res) => {
                setMessage(res);
                setShowModalButton(false);
                getClients();
            })
            .catch((err) => { setMessage(err) })
    };

    const handlePrevNew = () => {
        setMessage("Заполните все данные");
        setFormData({
            id: "",
            name: "",
            surname: "",
            age: "",
            phone: "",
            card: `${cards[0].id}`,
            password: "",
        })
        setShowNewButton(true);
        setShowModalEdit(true);
    };

    const handleNew = () => {
        if (formData.name && formData.surname && formData.age && formData.card && formData.phone && formData.password) {
            if (!isValidAge(formData.age)) {
                setMessage("Возраст не может быть меньше 7")
                return;
            }
            if (!isValidPhoneNumber(formData.phone)) {
                setMessage("Неверный формат номера телефона")
                return;
            }
            if (formData.password.split("").length < 6) {
                setMessage("Пароль не может быть меньше 6 символов")
                return;
            }
            invoke("new_anything", { data: `clients ( name, surname, age, phone, card, password ) VALUES ('${formData.name}', '${formData.surname}', '${formData.age}', '${formData.phone}', '${formData.card}', '${formData.password}')` })
                .then((res) => {
                    setMessage(res);
                    getClients();
                })
                .catch((err) => {
                    setMessage(err);
                });
        } else {
            setMessage("Заполните все поля");
        }
    }

    const handlePrint = () => {
        /* generateContract(); */
    }

    const getClients = () => {
        invoke("get_all_users", { user_type: "clients", condition: '' })
            .then((res) => {
                setUsers(res);
                console.log(res);
            }).catch((err) => console.log(err));
    };

    useEffect(() => {
        getClients();
        invoke("get_cards")
            .then((res) => {
                setCards(res);
                console.log(res);
            })
            .catch((err) => { console.log(err) });
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
                        <label className="text-gray-500 w-20">Имя</label>
                        <input placeholder="Имя" className="p-1 hover:bg-blue-600/10" type="text" value={formData.name} name="name" onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-20">Фамилия</label>
                        <input placeholder="Фамилия" className="p-1 hover:bg-blue-600/10" type="text" value={formData.surname} name="surname" onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-20">Возраст</label>
                        <input placeholder="Возраст" className="p-1 hover:bg-blue-600/10" type="text" value={formData.age} name="age" onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-20">Телефон</label>
                        <input placeholder="Телефон" className="p-1 hover:bg-blue-600/10" type="text" value={formData.phone} name="phone" onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-20">Карта</label>
                        <select value={formData.card} onChange={handleInputChange} name="card" >
                            {cards ? cards.map((card) =>
                                <option key={card.id} value={card.id}>{card.name}</option>
                            ) : <></>}
                        </select>
                    </div>
                    {showNewButton &&
                        <div className="flex flex-row gap-4">
                            <label className="text-gray-500 w-20">Пароль</label>
                            <input placeholder="Пароль" className="p-1 hover:bg-blue-600/10" type="text" value={formData.password} name="password" onChange={handleInputChange} />
                        </div>
                    }
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Фамилия</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Возраст</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Карта</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.surname}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.age}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{(cards.length > 0 && user.card) ? cards.find((card) => card.id === Number(user.card)).name : 'Нет карты'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-2" onClick={() => { setSelectedUser(user); handlePrevEdit(user) }}>
                                        Edit
                                    </button>
                                    <button className="text-red-600 hover:text-red-900" onClick={() => { setSelectedUser(user); handlePrevDelete(user) }}>
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
export { ClientsPage };