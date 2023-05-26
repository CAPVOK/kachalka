import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import Modal from "../../components/Modal";
import { useSelector } from "react-redux";

function MyLessonsPage() {
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalPay, setShowModalPay] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');

    const [lessons, setLessons] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [types, setTypes] = useState([]);
    const [trainers, setTrainers] = useState([]);

    console.log("lessons");
    const ClientId = useSelector((state) => state.user.user.id);

    const handleDelete = () => {
        invoke("delete_anything", { table: "lesson_clients", condition: `WHERE clientid = '${ClientId}' AND lessonid = ${selectedUser.id}` })
            .then((res) => {
                setMessage(res);
                getLessons(ClientId);
                handleCloseModal();
                if (selectedUser.typeid === 2) {

                    invoke("delete_anything", { table: "lessons", condition: `WHERE id = '${selectedUser.id}'` })
                        .then((res) => {
                            getLessons(ClientId);
                        })
                        .catch((err) => { setMessage(err); console.log(err) })
                }
            })
            .catch((err) => { setMessage(err) })
    };

    const handlePrevDelete = (lesson) => {
        setMessage(`Вы хотите отменить занятие ${lesson.date} ${lesson.time}?`);
        setShowModalDelete(true);
    }

    const handlePay = () => {
        invoke("edit_anything", {
            table: 'lessons',
            data: `room='${selectedUser.room}', 
            typeid='${selectedUser.typeid}', 
            pay='${"true"}', 
            trainer='${selectedUser.trainer}', 
            date='${selectedUser.date}', 
            time='${selectedUser.time}',
            comment='${selectedUser.comment}'`,
            condition: `where id='${selectedUser.id}'`
        })
            .then((res) => {
                setMessage(res);
                getLessons(ClientId);
                handleCloseModal();
            })
            .catch((err) => {
                setMessage(err);
            });
    };

    const handlePrevPay = () => {
        setShowModalPay(true);
    };

    const handleCloseModal = () => {
        setShowModalDelete(false);
        setShowModalPay(false)
        setMessage('');
    };

    const getLessons = () => {
        invoke("get_lessons_with_client", { id: ClientId })
            .then((res) => {
                setLessons(res.reverse());
                console.log(res);
            })
            .catch((err) => { console.log(err) });
    };

    function isDateTimeInFuture(date, time) {
        const currentTime = new Date();
        const dateTime = new Date(date + ' ' + time);
      
        return dateTime > currentTime;
      }

    useEffect(() => {
        getLessons();
        invoke("get_rooms").then((res) => { setRooms(res) }).catch((err) => { console.log(err) });
        invoke("get_types").then((res) => { setTypes(res) }).catch((err) => { console.log(err) });
        invoke("get_all_users", { user_type: "trainers", condition: '' }).then((res) => setTrainers(res)).catch((err) => console.log(err));
        invoke("get_all_users", { user_type: "clients", condition: '' }).then((res) => setClients(res)).catch((err) => console.log(err));
    }, []);

    return (<>
        <div className="w-full h-full p-4  text-black">
            {showModalDelete && <Modal onClose={handleCloseModal} >
                <div className="text-xl p-4">{message}</div>
                <div className="h-36 flex flex-row items-center justify-center">
                    <button onClick={handleDelete} className="bg-red-500 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Да!</button>
                </div>
            </Modal>}
            {showModalPay && <Modal onClose={handleCloseModal} >
                <div className="text-xl p-4">Тут типа оплата</div>
                <div className="h-36 flex flex-row items-center justify-center">
                    <button onClick={handlePay} className="bg-blue-600 rounded-lg h-min p-4 text-white transition ease-in-out hover:scale-105 active:scale-110">Оплатить</button>
                </div>
            </Modal>}
            <div className="w-12/12 mx-auto mt-5">
                <table className="min-w-full divide-y divide-gray-200 table-auto">
                    <thead className="bg-gray-100">
                        <tr>
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
                                <td className="px-6 py-4 whitespace-nowrap">{lesson.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{lesson.time.slice(0, 5)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{trainers.length > 0 ? `${trainers.find((trainer) => trainer.id === lesson.trainer).name} ${trainers.find((trainer) => trainer.id === lesson.trainer).surname}` : lesson.trainer}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{rooms.length > 0 ? rooms.find((room) => room.id === lesson.room).name : lesson.room}</td>
                                <td className="px-6 py-4 whitespace-normal">{types.length > 0 ? types.find((type) => type.id === lesson.typeid).name : lesson.typeid}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{lesson.typeid === 2 ? (lesson.pay ? "Оплачено" : "Не оплачено") : "Оплачено"}</td>
                                <td className="px-6 py-4 whitespace-normal flex flex-row justify-start">
                                    {isDateTimeInFuture(lesson.date, lesson.time) && <button onClick={(() => { handlePrevDelete(lesson); setSelectedUser(lesson) })} className="text-red-500 hover:text-red-700 mr-2">Отменить</button>}
                                    {(lesson.typeid === 2 && !lesson.pay) && <button onClick={(() => { handlePrevPay(); setSelectedUser(lesson) })} className="text-indigo-600 hover:text-indigo-900 mr-2">Оплатить</button>}
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
export { MyLessonsPage };
