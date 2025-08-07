/* eslint-disable react/prop-types */
import { createContext, useContext, useState, cloneElement } from "react";

const ModalContext = createContext();

export function Modal({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return (
        <ModalContext.Provider value={{ isOpen, open, close }}>
            {children}
        </ModalContext.Provider>
    );
}

Modal.Open = function ModalOpen({ children }) {
    const { open } = useContext(ModalContext);
    return cloneElement(children, {
        onClick: () => open(),
    });
};

Modal.Content = function ModalContent({ children }) {
    const { isOpen, close } = useContext(ModalContext);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
            <div className="bg-white rounded-lg shadow-lg w-fit p-6 relative">
                <button
                    onClick={close}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                    ✕
                </button>
                {children}
            </div>
        </div>
    );
};
