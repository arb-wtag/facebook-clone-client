import React from 'react'
import { Outlet } from "react-router-dom";
import Header from './Header';

export default function Root() {
  return (
    <div>
      <header>
        <Header></Header>
      </header>
      <main>
        <Outlet></Outlet>
      </main>
      <footer>

      </footer>
    </div>
  )
}
