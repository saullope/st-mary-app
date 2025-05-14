'use client'

import { useTranslations } from "next-intl";
import { LanguageSelector } from "./LanguageSelector";
import { BsGlobe } from 'react-icons/bs';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/images/Logo.png';
import bannerStMary from '../../public/images/BannerStmary.png';
import styles from './css/navbar.module.css';
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';



export const Sidebar = () => {

    const t = useTranslations("HomePage");

    return (
        <Navbar className="fixed navbar navbar-expand-lg bg-body-tertiary">
      <Container fluid >
          <Link href={'/home'} >
            <Image
              src={logo}
              alt="LudiGame logo"
              style={{ width: '150px', height: '55.19px', margin: '0px 30px' }}
              className="-inline-block align-top"
            />
          </Link>
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            <Link href="/home/howitworks" className={`${styles['nav-link']} nav-link text-primary fw-bold`}>
              {t('howItWorks')}
            </Link>
            <NavDropdown title={t('institution')} id="navbarScrollingDropdown" className={`${styles['nav-link']} text-primary fw-bold`}>
              <NavDropdown.Item as="div">
              <Link href='https://stmary.edu.ni/' className="dropdown-item " target="_blank">
                    Conoce sobre St. Mary School
                  </Link>
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <div className="d-grid gap-2 d-md-flex justify-content-center align-items-center">
              <BsGlobe />
              <LanguageSelector />
            </div>
            <Link href={'/auth/login'} >
              <Button variant="primary" className="me-md-2">
                {t('signIn')}
              </Button>
            </Link>
            <Link href={'/auth/signup'} >
              <Button variant="info">
                {t('signUp')}
              </Button>
            </Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
        
    );
}