import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import Modal from "../../components/Modal";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

function FutureLessonsPage() {
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

    console.log("lessons");
    const navigate = useNavigate();
    const ClientId = useSelector((state) => state.user.user.id);
    console.log(`${ClientId} - clientid`)

    const handleCloseModal = () => {
        setShowModalEdit(false);
        setMessage('');
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

    const getLessonClients = (user) => {
        invoke("get_lesson_clients", { id: `${user.id}` })
            .then((res) => {
                setLessonClients(res);
                setSelectedNewClient(clients
                    .filter((client) => !res.some((lessonClient) => lessonClient.id === client.id))[0].id)
            })
            .catch((err) => console.log(err));
    };

    const handlePrevEdit = (user) => {
        setMessage("Данные о тренировке");
        getLessonClients(user);
        setShowModalEdit(true);
    };

    const getLessons = () => {
        invoke("get_lessons", { condition: `where trainer = ${ClientId}`})
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
        invoke("get_all_users", { user_type: "clients", condition: '' }).then((res) => setClients(res)).catch((err) => console.log(err));
    }, []);

    return (<>
        <div className="w-full h-full p-4  text-black">
            {showModalEdit && <Modal onClose={handleCloseModal} >
                <div className="text-xl p-4">{message}</div>
                <div className="flex flex-col gap-2">

                    {selectedUser.comment && <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Комментарий</label>
                        {selectedUser.comment}
                    </div>}

                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Дата</label>
                        {selectedUser.date}
                    </div>

                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Время</label>
                        {selectedUser.time}
                    </div>

                    <div className="flex flex-row gap-4">
                        <label className="text-gray-500 w-32">Зал</label>
                        {rooms.length > 0 ? rooms.find((room) => room.id === selectedUser.room).name : selectedUser.room}
                    </div>

                    <div className="text-xl p-4">Участники:</div>
                    <div className="w-full flex flex-col">
                        {lessonClients.length > 0 && (
                            lessonClients.map((client) => (
                                <div key={client.id} className="p-2 flex flex-row justify-between border-b-[1px] border-gray-300">
                                    <div>
                                        {client.name} {client.surname}
                                    </div>
                                </div>
                            ))
                        )}

                    </div>
                    <div>
                        <div className="h-36 flex flex-row items-center justify-between">
                            <button onClick={handleDelete} className="bg-red-500 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Отменить тренировку</button>
                        </div>
                    </div>
                </div>
            </Modal>}
            <div className="w-12/12 mx-auto mt-5">
                <table className="min-w-full divide-y divide-gray-200 table-auto">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Время</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Зал</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {lessons.length > 0 && lessons.map((lesson) => (<>
                            <tr key={lesson.id} className="hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap">{lesson.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{lesson.time.slice(0, 5)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{rooms.length > 0 ? rooms.find((room) => room.id === lesson.room).name : lesson.room}</td>
                                <td className="px-6 py-4 whitespace-normal">{types.length > 0 ? types.find((type) => type.id === lesson.typeid).name : lesson.typeid}</td>
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
export { FutureLessonsPage };
