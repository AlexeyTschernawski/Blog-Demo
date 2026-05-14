import { Footer, FooterCopyright, FooterDivider, FooterLinkGroup, FooterTitle } from "flowbite-react"
import { Link } from 'react-router-dom';
import { assets } from "../assets/assets";
import { useState } from 'react';
import ContactModal from './ContactModal';

export default function FooterCom() {
    const [showContactModal, setShowContactModal] = useState(false);

    return (
        <>
            <Footer container className='border border-t-8 border-gray-800'>
                <div className='w-full max-w-7xl mx-auto'>
                    <div className='grid w-full justify-between sm:flex md:grid-cols-1'>
                        <div className='mt-5'>
                         
                            <img
                                src={assets.logo}
                                alt="logo"
                                className="w-32 sm:w-44"
                            />
                            <p className="text-gray-600 text-sm mt-2 max-w-xs">
                                Your source for news and information. Stay informed with our latest updates.
                            </p>
                        </div>
                        <div className='grid grid-cols-1 gap-8 mt-4 sm:grid-cols-2 sm:gap-6'>
                            <div>
                                <FooterTitle title='Quick Links' />
                                <FooterLinkGroup col>
                                 
                                    <Link
                                        to="/"
                                        className="text-gray-600 hover:text-black transition-colors text-sm"
                                        onClick={() => window.scrollTo(0, 0)}
                                    >
                                        Home
                                    </Link>
                               
                                    <button 
                                        onClick={() => setShowContactModal(true)}
                                        className="text-gray-600 hover:text-black transition-colors text-sm text-left"
                                    >
                                        Contact
                                    </button>
                                </FooterLinkGroup>
                            </div>
                            <div>
                                <FooterTitle title='Legal' />
                                <FooterLinkGroup col>
                                    <Link to="/privacy-policy" className="text-gray-600 hover:text-black transition-colors text-sm">
                                        Privacy Policy
                                    </Link>
                                    <Link to="/terms-conditions" className="text-gray-600 hover:text-black transition-colors text-sm">
                                        Terms & Conditions
                                    </Link>
                                </FooterLinkGroup>
                            </div>
                        </div>
                    </div>
                    <FooterDivider />
                    <div className='w-full sm:flex sm:items-center sm:justify-between'>
                     
                        <FooterCopyright
                            href='/'
                            by="IC INFORM"
                            year={new Date().getFullYear()}
                            className="text-gray-600"
                        />
                        <div className="text-sm text-gray-600 mt-2 sm:mt-0">
                            <p>© {new Date().getFullYear()} IC INFORM. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </Footer>

            <ContactModal 
                showModal={showContactModal} 
                setShowModal={setShowContactModal} 
            />
        </>
    );
}