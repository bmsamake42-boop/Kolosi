import Navbar from "../composants/Navbar"

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <Navbar />

            {/* Contenu de la page */}
            <main>
                {children}
            </main>

        </div>
    );
};

export default Layout;