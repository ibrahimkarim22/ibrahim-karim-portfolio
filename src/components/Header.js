import { useEffect, useState } from "react";
import { Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, Collapse, Button } from "reactstrap";
import { NavLink } from "react-router-dom";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    return (
        <Navbar light expand="md">
            <NavbarBrand href="/">
                Ibrahim Karim
            </NavbarBrand>

            <NavbarToggler onClick={() => setMenuOpen(!menuOpen)} />

            <Collapse isOpen={menuOpen} navbar>

                <Nav className="ml-auto" navbar>
                    <NavItem>
                        <NavLink to="/" className="nav-link" onClick={closeMenu}>Home</NavLink>
                    </NavItem>
                </Nav>
            </Collapse>
        </Navbar>
    );
};

export default Header;
