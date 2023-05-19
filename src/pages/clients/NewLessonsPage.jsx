import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import Modal from "../../components/Modal";
import { useSelector } from "react-redux";

function NewLessonsPage() {
    const [showModalAdd, setShowModalAdd] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [showNewButton, setShowNewButton] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');

    const [lessons, setLessons] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [types, setTypes] = useState([]);
    const [trainers, setTrainers] = useState([]);

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
    const ClientId = useSelector((state) => state.user.user.id);

    const handleAddClient = () => {
        invoke("new_anything", {
            data: `lesson_clients ( clientid, lessonid ) 
    VALUES ('${ClientId}', '${selectedUser.id}')`
        })
            .then((res) => {
                setMessage(res);
                getLessons(selectedUser);
            })
            .catch((err) => {
                setMessage(err);
            });
    };

    const handleCloseModal = () => {
        setShowModalEdit(false);
        setShowModalAdd(false);
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

    const handlePrevAdd = (user) => {
        setMessage(`Вы хотите записаться на тренировку ${user.date} ${user.time}`);
        setShowModalAdd(true);
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
            setMessage("Введите корректное время!")
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
            typeid: '2',
            room: '1',
            trainer: '1',
            comment: '',
        })
        setShowNewButton(true);
        setShowModalEdit(true);
    };

    const handleNew = () => {
        if (validTime()) {
            if (formData.room && formData.date && formData.time && formData.trainer) {
                invoke("add_lesson_with_client", {
                    data: `lessons ( room, date, time, typeid, pay, trainer, comment ) 
            VALUES ('${formData.room}', '${formData.date}', '${formData.time}', '2', 'false', '${formData.trainer}', '${formData.comment}')`,
                    client_id: ClientId,
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

    const getLessons = () => {
        invoke("get_lessons_without_client", { id: ClientId })
            .then((res) => {
                setLessons(res);
                console.log(res);
            })
            .catch((err) => { console.log(err) });
    };

    useEffect(() => {
        getLessons();
        invoke("get_rooms").then((res) => { setRooms(res) }).catch((err) => { console.log(err) });
        invoke("get_types").then((res) => { setTypes(res) }).catch((err) => { console.log(err) });
        invoke("get_all_users", { user_type: "trainers", condition: '' }).then((res) => setTrainers(res)).catch((err) => console.log(err));
    }, []);

    return (<>
        <div className="w-full h-full p-4  text-black">
            {showModalEdit && <Modal onClose={handleCloseModal} >
                <div className="text-xl p-4">{message}</div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Комментарий</label>
                        <input className="p-1 hover:bg-blue-600/10" type="text" value={formData.comment} name="comment" onChange={handleInputChange} />
                    </div>

                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Тип</label>
                        <div>Персональная тренировка</div>
                    </div>

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

                    <div>
                        <div className="h-36 flex flex-row items-center justify-between">
                            <button onClick={handleNew} className="bg-blue-600 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Добавить</button>
                        </div>
                    </div>
                </div>
            </Modal>}
            {showModalAdd && <Modal onClose={handleCloseModal} >
                <div className="text-xl p-4">{message}</div>
                <div className="h-36 flex flex-row items-center justify-center">
                    <button onClick={handleAddClient} className="bg-blue-600 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Записаться</button>
                </div>
            </Modal>}
            <div className="w-12/12 mx-auto mt-5">
                <div className="w-full flex flex-row pb-4 gap-4">
                    <button onClick={handlePrevNew} className="bg-blue-600 rounded-lg h-min p-2 text-white transition ease-in-out hover:scale-105 active:scale-110">Добавить</button>
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
                            <tr key={lesson.id} className="hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap">{lesson.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{lesson.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{lesson.time.slice(0, 5)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{trainers.length > 0 ? `${trainers.find((trainer) => trainer.id === lesson.trainer).name} ${trainers.find((trainer) => trainer.id === lesson.trainer).surname}` : lesson.trainer}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{rooms.length > 0 ? rooms.find((room) => room.id === lesson.room).name : lesson.room}</td>
                                <td className="px-6 py-4 whitespace-normal">{types.length > 0 ? types.find((type) => type.id === lesson.typeid).name : lesson.typeid}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{lesson.pay ? "Оплачено" : "Не оплачено"}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button onClick={(() => { handlePrevAdd(lesson); setSelectedUser(lesson) })} className="text-indigo-600 hover:text-indigo-900 mr-2">Записаться</button>
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
export { NewLessonsPage };
