import { useEffect, useState } from "react";
import { Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, Collapse, Button } from "reactstrap";
import { NavLink } from "react-router-dom";
import Mm from "../components/Mm";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    return (
        <Navbar dark expand="md" sticky="top" className="navbar p-2 mb-5 shadow ">
            <NavbarBrand href="/">
                <Mm />
            </NavbarBrand>

            <NavbarToggler onClick={() => setMenuOpen(!menuOpen)} />

            <Collapse isOpen={menuOpen} navbar>

                <Nav className="ml-auto" navbar>
                    {/* <NavItem>
                        <NavLink to="/" className="nav-link" onClick={closeMenu}>Home</NavLink>
                    </NavItem> */}
                </Nav>
            </Collapse>
        </Navbar>
    );
};

export default Header;
