import React from "react";
import Link from "next/link";
import styled from "@emotion/styled";

const Header: React.FC = () => {
  return (
    <NavBar>
      <NavList>
        <NavItem>
          <Link href="/">Home</Link>
        </NavItem>
        <NavItem>
          <Link href="/dashboard">Dashboard</Link>
        </NavItem>
        <NavItem>
          <Link href="/notices">Notices</Link>
        </NavItem>
        <NavItem>
          <Link href="/notifications">Notifications</Link>
        </NavItem>
        <NavItem>
          <Link href="/popup">Manage Popup</Link>
        </NavItem>
        <NavItem>
          <Link href="/purchase/purchase-failure">Purchase Failures</Link>
        </NavItem>
        <NavItem>
          <Link href="/login">Login</Link>
        </NavItem>
      </NavList>
    </NavBar>
  );
};

const NavBar = styled.nav`
  background-color: #333;
  height: 60px;
  padding: 20px 20px;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin-right: 20px;

  a {
    color: #fff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default Header;
