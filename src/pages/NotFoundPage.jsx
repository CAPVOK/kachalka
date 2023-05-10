import { Link } from "react-router-dom";

function NotFoundPage () {

    return(<>
         <div className="text-xl text-black">
            <Link to="/">Домой</Link>
         </div>
    </>)
}

export {NotFoundPage};