import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Create() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Profil Oluştur</h1>
        <p className="text-xl text-gray-600 mb-8">
          On-chain LinkTree profilinizi oluşturun
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-4">
              Smart contract deploy edildikten sonra profil oluşturma formu aktif olacak.
            </p>
            <p className="text-sm">
              Kullanıcı Adresi: {session.address}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

