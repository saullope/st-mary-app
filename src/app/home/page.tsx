import { Metadata } from "next";
import { useTranslations } from "next-intl";
import Image from "next/image";
import landing from '../../../public/images/FondoLandingpage.png';
import banner from '../../../public/images/Banner1.png';

export const metadata: Metadata = {
    title: "LudiGame",
    description: "",
  };

export default function HomePage(){

    const t = useTranslations("HomePage");

    return (
        <div>
      <div>
        <Image src={landing} alt="fondo" style={{ width: '100%', height: 'auto' }} />
      </div>


      <div>
        <Image src={banner} alt="banner1" style={{ width: '100%', height: 'auto' }} />
      </div>
    </div>
    )
}