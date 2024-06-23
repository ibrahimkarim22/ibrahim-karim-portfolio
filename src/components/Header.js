import { useEffect, useState } from "react";
import { Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, Collapse, Button } from "reactstrap";
import { NavLink } from "react-router-dom";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [lightMode, setLightMode] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    const toggleLightMode = () => setLightMode(prevMode => !prevMode);

    useEffect(() => {
        const body = document.body;
        body.style.backgroundColor = lightMode ? '#f8f9fa' : '#212529';
    }, [lightMode]);

    return (
        <Navbar dark={lightMode ? false : true} color={lightMode ? 'light' : 'dark'} expand="md">
            <NavbarBrand href="/">
                Ibrahim Karim
            </NavbarBrand>

            <NavbarToggler onClick={() => setMenuOpen(!menuOpen)} />

            <Collapse isOpen={menuOpen} navbar>

                <Nav className="ml-auto" navbar>
                    <NavItem>
                        <NavLink to="/" className="nav-link" onClick={closeMenu}>Home</NavLink>
                    </NavItem>
                    <NavItem>
                        <Button color={lightMode ? 'dark' : 'light'} onClick={toggleLightMode}>Toggle Mode</Button>
                    </NavItem>
                </Nav>
            </Collapse>
        </Navbar>
    );
};

export default Header;
