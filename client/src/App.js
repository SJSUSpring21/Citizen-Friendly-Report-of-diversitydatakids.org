import './App.css'
import Axios from "axios"
import { useState } from "react"

function App() {
  const [content, setContent] = useState([])
  const [genText, setGenText] = useState([])
  
  const clickHandler = () => {
    Axios.get('http://localhost:5000/click').then(result => setContent(JSON.stringify(result.data.result)))
  }

  const clickHandler2 = () => {
    Axios.get('http://localhost:5000/').then(result => setGenText(result.data))
  }
  
  return (
    <div className="App">
       <div>{content}</div>
       <button id="test1" onClick={clickHandler} > CKAN </button>
       <button id="test1" onClick={clickHandler2} > Rosa Tut </button>
       <div>{genText}</div>
    </div>
    
  )
}

export default App;
