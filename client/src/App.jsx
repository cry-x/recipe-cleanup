import { BrowserRouter, Routes, Route } from 'react-router';
import Footer from './components/Footer';
import Input from './components/Input';
import RecipePage from './pages/RecipePage';
import './App.css'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Footer />}>
            <Route path='/' element={<Input />} />
            <Route path='/clean' element={<RecipePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
