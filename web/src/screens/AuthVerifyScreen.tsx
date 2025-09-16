import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import BrandLogo from '../components/BrandLogo';

const AuthVerifyScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      const userType = searchParams.get('type');

      if (!token || !email || !userType) {
        toast.error('Geçersiz giriş linki');
        navigate('/login');
        return;
      }

      try {
        // Backend'e token verify request gönder
        const response = await fetch(`http://localhost:8000/auth/verify?token=${token}&email=${email}&type=${userType}`);
        const data = await response.json();

        if (response.ok) {
          toast.success(`Hoş geldin! ${data.user_type_label} olarak giriş yaptın`);
          
          // User bilgilerini localStorage'a kaydet (demo için)
          localStorage.setItem('uphera_user', JSON.stringify({
            email: email,
            userType: userType,
            userTypeLabel: data.user_type_label
          }));

          // Anasayfaya yönlendir
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          toast.error(data.detail || 'Giriş linki doğrulanamadı');
          navigate('/login');
        }
      } catch (error) {
        console.error('Verify error:', error);
        toast.error('Bağlantı hatası');
        navigate('/login');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--up-light-gray)' }}>
      <div className="up-card p-8 text-center">
        <div className="mb-6">
                                                     <BrandLogo size={96} />
        </div>
        
        {isVerifying ? (
          <>
            <div className="up-loading mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
              Giriş Doğrulanıyor
            </h2>
            <p style={{ color: 'var(--up-dark-gray)' }}>
              Lütfen bekleyin...
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
              Yönlendiriliyor
            </h2>
            <p style={{ color: 'var(--up-dark-gray)' }}>
              Up Hera anasayfasına yönlendiriliyorsunuz...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthVerifyScreen; 