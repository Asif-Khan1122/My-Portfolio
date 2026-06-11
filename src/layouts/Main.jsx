import { Outlet } from "react-router-dom";
import Footer from "../components/common/footer/Footer";
import ScrollToTop from "../components/common/scrollToTop/ScrollToTop";

const Main = () => {
  return (
    <div data-theme={"light"} className='relative'>
      <Outlet />
      <div className='bg-[#2A374A]'>
        <Footer />
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Main;
