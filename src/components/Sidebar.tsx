import { useTranslations } from "next-intl";
import LanguageSelector from "./LanguageSelector";
import { BsGlobe } from 'react-icons/bs';

export default function Sidebar() {

    const t = useTranslations("HomePage");

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm"> {/* Add the "shadow-sm" class */}
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">St Mary App</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="#">{t('howItWorks')}</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">{t('institution')}</a>
                            </li>
                        </ul>
                        <div className="flex me-2">
                        <BsGlobe />
                        </div>
                        <div className="d-flex">
                            <LanguageSelector />
                        </div>
                        <div className="d-flex">
                            <button type="button" className="btn btn-outline-primary btn-sm me-2">{t('signIn')}</button>
                            <button type="button" className="btn btn-success btn-sm">{t('signUp')}</button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}