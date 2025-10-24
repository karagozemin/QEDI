import { Link } from 'react-router-dom';
import { ConnectButton } from '@mysten/dapp-kit';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { session, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              QEDİ
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/explore"
              className="text-gray-700 hover:text-violet-600 font-medium transition"
            >
              Keşfet
            </Link>
            {session && (
              <>
                <Link
                  to="/create"
                  className="text-gray-700 hover:text-violet-600 font-medium transition"
                >
                  Profil Oluştur
                </Link>
                <Link
                  to={`/${session.address}`}
                  className="text-gray-700 hover:text-violet-600 font-medium transition"
                >
                  Profilim
                </Link>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-sm text-gray-600">
                  {session.address.slice(0, 6)}...{session.address.slice(-4)}
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

