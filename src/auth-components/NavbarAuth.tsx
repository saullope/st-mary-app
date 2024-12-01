import { useTranslations } from "next-intl";
import {LanguageSelector} from "./../components/LanguageSelector";
import { BsGlobe } from 'react-icons/bs';
import logo from '../../public/images/Logo.png';
import Image from "next/image";
import Link from 'next/link';

export const NavbarAuth = () => {

    const t = useTranslations("HomePage");

    return (
           <nav className={`fixed navbar navbar-expand-lg bg-body-tertiary`}>
            <div className="container-fluid">
                <Link href={'/home'}>
                <Image
              src={logo}
              alt="LudiGame logo"
              style={{ width: '150px', height: '55.19px', margin: '0px 30px' }}
              className="-inline-block align-top"
            />
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                </div>
                    <div className="d-grid gap-2 d-md-flex justify-content-center justify-content-md-end align-items-center">
                        <BsGlobe />
                        <LanguageSelector />
                </div>
            </div>
        </nav>
    );
}