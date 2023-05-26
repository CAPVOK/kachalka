import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import Modal from "../../components/Modal";
import { Container } from "postcss";

function LessonsPage() {
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [showNewButton, setShowNewButton] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');

    const [lessons, setLessons] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [types, setTypes] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [clients, setClients] = useState([]);
    const [lessonClients, setLessonClients] = useState([]);
    const [selectedNewClient, setSelectedNewClient] = useState([]);

    const [formData, setFormData] = useState({
        id: '',
        date: '',
        time: '',
        pay: '',
        typeid: '',
        room: '',
        trainer: '',
        comment: '',
    });

    console.log("lessons");

    const handleDeleteClient = (client) => {
        invoke("delete_anything", { table: "lesson_clients", condition: `WHERE clientid = '${client.id}' AND lessonid = ${selectedUser.id}` })
            .then((res) => {
                setMessage(res);
                getLessonClients(selectedUser);
            })
            .catch((err) => { setMessage(err) })
    };

    const handleAddClient = () => {
        invoke("new_anything", {
            data: `lesson_clients ( clientid, lessonid ) 
    VALUES ('${selectedNewClient}', '${selectedUser.id}')`
        })
            .then((res) => {
                setMessage(res);
                getLessonClients(selectedUser);
            })
            .catch((err) => {
                setMessage(err);
            });
    };

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
        if (validTime()) {
            if (formData.id && formData.room && formData.date && formData.time && formData.typeid && formData.trainer) {
                invoke("edit_anything", {
                    table: 'lessons',
                    data: `room='${formData.room}', 
            typeid='${formData.typeid}', 
            pay='${formData.pay}', 
            trainer='${formData.trainer}', 
            date='${formData.date}', 
            time='${formData.time}',
            comment='${formData.comment}'`,
                    condition: `where id='${formData.id}'`
                })
                    .then((res) => {
                        setMessage(res);
                        getLessons();
                    })
                    .catch((err) => {
                        setMessage(err);
                    });
            } else {
                setMessage("Заполните все поля");
            }
        }
    };

    const handlePrevEdit = (user) => {
        setMessage("Измените данные");
        setFormData(user)
        getLessonClients(user);
        setShowNewButton(false);
        setShowModalEdit(true);
    };

    const handleDelete = () => {
        invoke("delete_anything", { table: "lessons", condition: `where id = '${selectedUser.id}'` })
            .then((res) => {
                setMessage(res);
                getLessons();
                handleCloseModal();
            })
            .catch((err) => { setMessage(err) })
    };

    const validTime = () => {
        let date = new Date();
        date.setFullYear(formData.date.slice(0, 4));
        date.setMonth(formData.date.slice(5, 7) - 1);
        date.setDate(formData.date.slice(8,));
        date.setHours(formData.time.slice(0, 2));
        date.setMinutes(formData.time.slice(3, 5));
        date.setSeconds(0);
        date.setMilliseconds(0);
        let newDate = new Date();
        if (date.getTime() < newDate.getTime()) {
            setMessage("Эта тренировка уже прошла, введите правильное время")
            return false;
        }
        const currentFormattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (!(currentFormattedTime >= '07:30' && currentFormattedTime <= '22:30') || (formData.time.slice(3, 5) % 10 !== 0)) {
            setMessage("Выберите время с 7:30 до 22:30 с интервалом 30 мин")
            return false;
        }
        return true;
    };

    const handlePrevNew = () => {
        setMessage("Заполните данные");
        setFormData({
            id: '',
            date: '',
            time: '',
            pay: 'false',
            typeid: `${types[0].id}`,
            room: `${rooms[0].id}`,
            trainer: `${trainers[0].id}`,
            comment: '',
        })
        setShowNewButton(true);
        setShowModalEdit(true);
    };

    const handleNew = () => {
        if (validTime()) {
            if (formData.room && formData.date && formData.time && formData.typeid && formData.trainer) {
                invoke("new_anything", {
                    data: `lessons ( room, date, time, typeid, pay, trainer, comment ) 
            VALUES ('${formData.room}', '${formData.date}', '${formData.time}', '${formData.typeid}', '${formData.pay}', '${formData.trainer}', '${formData.comment}')`
                })
                    .then((res) => {
                        setMessage(res);
                        getLessons();
                    })
                    .catch((err) => {
                        setMessage(err);
                    });
            } else {
                setMessage("Заполните все поля");
            }
        }
    }

    const handlePrint = () => {
        /*  */
    }

    function isDateTimeInFuture(date, time) {
        const currentTime = new Date();
        const dateTime = new Date(date + ' ' + time);

        return dateTime > currentTime;
    }

    const getLessonClients = (user) => {
        invoke("get_lesson_clients", { id: `${user.id}` })
            .then((res) => {
                setLessonClients(res);
                setSelectedNewClient(clients
                    .filter((client) => !res.some((lessonClient) => lessonClient.id === client.id))[0].id)
            })
            .catch((err) => console.log(err));
    };

    const getLessons = () => {
        invoke("get_lessons", { condition: "" })
            .then((res) => {
                setLessons(res.reverse());
                console.log(res);
            })
            .catch((err) => { console.log(err) });
    };

    useEffect(() => {
        getLessons();
        invoke("get_rooms").then((res) => { setRooms(res) }).catch((err) => { console.log(err) });
        invoke("get_types").then((res) => { setTypes(res) }).catch((err) => { console.log(err) });
        invoke("get_all_users", { user_type: "trainers", condition: '' }).then((res) => setTrainers(res)).catch((err) => console.log(err));
        invoke("get_all_users", { user_type: "clients", condition: '' }).then((res) => setClients(res)).catch((err) => console.log(err));
    }, []);

    return (<>
        <div className="w-full h-full p-4  text-black">
            {showModalEdit && <Modal onClose={handleCloseModal} >
                <div className="text-xl p-4">{message}</div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Комментарий</label>
                        <input placeholder="Комментарий" className="p-1 hover:bg-blue-600/10" type="text" value={formData.comment ? formData.comment : ""} name="comment" onChange={handleInputChange} />
                    </div>
                    {showNewButton ?
                        <div className="flex flex-row gap-4">
                            <label className="text-gray-500 w-32">Тип</label>
                            <select value={formData.typeid} onChange={handleInputChange} name="typeid" >
                                {types.map((type) =>
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                )}
                            </select>
                        </div>
                        :
                        <div className="flex flex-row gap-4">
                            <label className="text-gray-500 w-32">Тип</label>
                            <div>{types.find((type) => type.id === formData.typeid).name}</div>
                        </div>
                    }
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Дата</label>
                        <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Время</label>
                        <input type="time" name="time" value={formData.time} onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Зал</label>
                        <select value={formData.room} onChange={handleInputChange} name="room" >
                            {rooms.map((room) =>
                                <option key={room.id} value={room.id}>{room.name}</option>
                            )}
                        </select>
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Тренер</label>
                        <select value={formData.trainer} onChange={handleInputChange} name="trainer" >
                            {trainers.map((trainer) =>
                                <option key={trainer.id} value={trainer.id}>{trainer.name} {trainer.surname}</option>
                            )}
                        </select>
                    </div>
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Оплата</label>
                        <select value={formData.pay} onChange={handleInputChange} name="pay" >
                            <option value={true}>Оплачено</option>
                            <option value={false}>Не оплачено</option>
                        </select>
                    </div>
                    {!showNewButton && <>
                        <div className="text-xl p-4">Участники:</div>
                        <div className="w-full flex flex-col">
                            {lessonClients.length > 0 && (
                                lessonClients.map((client) => (
                                    <div key={client.id} className="p-2 flex flex-row justify-between border-b-[1px] border-gray-300">
                                        <div>
                                            {client.name} {client.surname}
                                        </div>
                                        <button onClick={() => handleDeleteClient(client)} className="text-red-500 transition ease-in-out hover:scale-105 active:scale-110">Del</button>
                                    </div>
                                ))
                            )}

                            {!(selectedUser.typeid === 2 && lessonClients.length !== 0) && <div className="p-2 flex flex-row justify-between border-b-[1px] border-gray-300">
                                <select value={selectedNewClient} onChange={(e) => setSelectedNewClient(e.target.value)}>
                                    {clients
                                        .filter((client) => !lessonClients.some((lessonClient) => lessonClient.id === client.id))
                                        .map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name} {client.surname}
                                            </option>
                                        ))
                                    }
                                </select>
                                <button onClick={() => handleAddClient()} className="text-blue-500 transition ease-in-out hover:scale-105 active:scale-110">Add</button>
                            </div>}

                        </div>
                    </>

                    }
                    <div>
                        <div className="h-36 flex flex-row items-center justify-between">
                            {!showNewButton && <button onClick={handleDelete} className="bg-red-500 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Удалить</button>}
                            {!showNewButton ? <button onClick={handleEdit} className="bg-blue-600 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Изменить</button> :
                                <button onClick={handleNew} className="bg-blue-600 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Добавить</button>}
                        </div>
                    </div>
                </div>
            </Modal>}
            <div className="w-12/12 mx-auto mt-5">
                <div className="w-full flex flex-row pb-4 gap-4">
                    <button onClick={handlePrevNew} className="bg-blue-600 rounded-lg h-min p-2 text-white transition ease-in-out hover:scale-105 active:scale-110">Добавить</button>
                    <button onClick={handlePrint} className="bg-amber-600 rounded-lg h-min p-2 text-white transition ease-in-out hover:scale-105 active:scale-110">Печать</button>
                </div>
                <table className="min-w-full divide-y divide-gray-200 table-auto">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Время</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тренер</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Зал</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оплата</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {lessons.map((lesson) => (<>
                            <tr key={lesson.id} className={`${isDateTimeInFuture(lesson.date, lesson.time) ? 'font-medium' : " font-extralight"} hover:bg-gray-100`}>
                                <td className="px-6 py-4 whitespace-nowrap">{lesson.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{lesson.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{lesson.time.slice(0, 5)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{trainers.length > 0 ? `${trainers.find((trainer) => trainer.id === lesson.trainer).name} ${trainers.find((trainer) => trainer.id === lesson.trainer).surname}` : lesson.trainer}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{rooms.length > 0 ? rooms.find((room) => room.id === lesson.room).name : lesson.room}</td>
                                <td className="px-6 py-4 whitespace-normal">{types.length > 0 ? types.find((type) => type.id === lesson.typeid).name : lesson.typeid}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{lesson.pay ? "Оплачено" : "Не оплачено"}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button onClick={(() => { handlePrevEdit(lesson); setSelectedUser(lesson) })} className="text-indigo-600 hover:text-indigo-900 mr-2">Подробнее</button>
                                </td>
                            </tr>
                        </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </>)
}
export { LessonsPage };
