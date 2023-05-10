import { Form, Link } from "react-router-dom"
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import Modal from "../../components/Modal";

function TrainersPage() {
    const [users, setUsers] = useState([]);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModalButton, setShowModalButton] = useState(true);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        surname: "",
        age: "",
        phone: "",
        specialization: "",
        password: "",
    });
    const [showNewButton, setShowNewButton] = useState(false);


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
        if (formData.name && formData.surname && formData.age && formData.specialization && formData.phone) {
            invoke("edit_anything", { table: 'trainers', data: `name='${formData.name}', surname='${formData.surname}', age='${formData.age}', phone='${formData.phone}', specialization='${formData.specialization}'`, condition: `where id='${formData.id}'` })
                .then((res) => {
                    setMessage(res);
                    setUsers([]);
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
        invoke("delete_anything", { table: "trainers", condition: `where id = '${selectedUser.id}'` })
            .then((res) => {
                setMessage(res);
                setShowModalButton(false);
                setUsers([]);
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
            specialization: "",
            password: "",
        })
        setShowNewButton(true);
        setShowModalEdit(true);
    };

    const handleNew = () => {
        if (formData.name && formData.surname && formData.age && formData.specialization && formData.phone && formData.password) {
            console.log(`trainers ( name, surname, age, phone, specialization, password ) VALUES (name='${formData.name}', surname='${formData.surname}', age='${formData.age}', phone='${formData.phone}', specialization='${formData.specialization}', password='${formData.password}')`);
            invoke("new_anything", { data: `trainers ( name, surname, age, phone, specialization, password ) VALUES ('${formData.name}', '${formData.surname}', '${formData.age}', '${formData.phone}', '${formData.specialization}', '${formData.password}')` })
                .then((res) => {
                    setMessage(res);
                    setUsers([]);
                })
                .catch((err) => {
                    setMessage(err);
                });
        } else {
            setMessage("Заполните все поля");
        }
    }

    const handlePrint =() => {
        /*  */
    }

    useEffect(() => {
        invoke("get_all_users", { user_type: "trainers" })
            .then((res) => {
                setUsers(res);
            }).catch((err) => console.log(err));
    }, [users])

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
                        <label className="text-gray-500 w-32">Имя</label>
                        <input className="p-1 hover:bg-blue-600/10" type="text" value={formData.name} name="name" onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Фамилия</label>
                        <input className="p-1 hover:bg-blue-600/10" type="text" value={formData.surname} name="surname" onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Возраст</label>
                        <input className="p-1 hover:bg-blue-600/10" type="text" value={formData.age} name="age" onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Телефон</label>
                        <input className="p-1 hover:bg-blue-600/10" type="text" value={formData.phone} name="phone" onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Специализация</label>
                        <select value={formData.specialization} onChange={handleInputChange} name="specialization" >
                            <option value="Бег">Бег</option>
                            <option value="Йога">Йога</option>
                            <option value="Фитнес-тренер">Фитнес-тренер</option>
                            <option value="Боевые искусства">Боевые искусства</option>
                            <option value="Футбол">Футбол</option>
                        </select>
                    </div>
                    {showNewButton &&
                        <div className="flex flex-row gap-4">
                            <label className="text-gray-500 w-32">Пароль</label>
                            <input className="p-1 hover:bg-blue-600/10" type="text" value={formData.password} name="password" onChange={handleInputChange} />
                        </div>
                    }
                    <div>
                        <div className="h-36 flex flex-row items-center justify-center">
                            {!showNewButton ? <button onClick={handleEdit} className="bg-blue-600 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Изменить</button>
                                : <button onClick={handleNew} className="bg-blue-600 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Сохранить</button>}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Специализация</th>
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
                                <td className="px-6 py-4 whitespace-nowrap">{user.specialization}</td>
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
export { TrainersPage };