import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BrandLogo from '../components/BrandLogo';
import { GraduationCap, Shield } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userType, setUserType] = useState<'mezun' | 'admin'>('mezun');
  
  // Registration form states for UpSchool graduates
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bootcampProgram: '',
    graduationYear: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    primarySkills: [] as string[],
    experienceLevel: 'entry',
    password: '',
    confirmPassword: ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        toast.error('E-posta ve şifre gerekli');
        setIsLoading(false);
        return;
      }

      console.log('🔐 Giriş denemesi:', email);

      // Demo hesap kontrolü - hızlı giriş için
      if (email === 'cerennyurtlu@gmail.com' && password === '123456') {
        // Demo kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('uphera_user', JSON.stringify({
          id: 'demo-user-123',
          name: 'Ceren Yurtlu',
          email: email,
          program: 'Data Science',
          isLoggedIn: true,
          token: 'demo-token-123',
          loginAt: new Date().toISOString(),
          userType: userType
        }));

        toast.success('Hoş geldin Ceren! Demo hesap ile giriş yapıldı.');
        navigate('/dashboard');
        return;
      }

      // Admin hızlı giriş (offline demo için)
      if (email === 'admin@gmail.com' && password === '123456') {
        localStorage.setItem('uphera_user', JSON.stringify({
          id: 'admin-user-1',
          name: 'Admin User',
          email: email,
          program: 'Administration',
          isLoggedIn: true,
          token: 'demo-token-admin',
          loginAt: new Date().toISOString(),
          userType: 'admin'
        }));

        toast.success('Admin olarak giriş yapıldı.');
        navigate('/admin');
        return;
      }

      // Normal login API çağrısı
      const apiUrls = [
        'http://127.0.0.1:8000/api/auth/login',
        'http://localhost:8000/api/auth/login'
      ];

      let response;
      let lastError;

      for (const apiUrl of apiUrls) {
        try {
          console.log(`🔗 Login URL deneniyor: ${apiUrl}`);
          
          response = await fetch(apiUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              password: password,
              user_type: userType
            })
          });
          
          console.log(`✅ Login ${apiUrl} başarılı - Status:`, response.status);
          break;
          
        } catch (error) {
          console.log(`❌ Login ${apiUrl} başarısız:`, error);
          lastError = error;
          continue;
        }
      }

      if (!response) {
        throw lastError || new Error('Login API\'lerine ulaşılamadı');
      }

      const data = await response.json();
      
      if (response.ok && data.success) {
        // User bilgilerini localStorage'a kaydet
        localStorage.setItem('uphera_user', JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          program: data.user.program,
          isLoggedIn: true,
          token: data.token,
          loginAt: new Date().toISOString(),
          userType: data.user.user_type || 'mezun'
        }));

        toast.success(`Hoş geldin ${data.user.name}!`);
        // Admin ise admin dashboard'a yönlendir
        const redirectPath = data.redirect_url || (data.user.user_type === 'admin' ? '/admin' : '/jobs');
        navigate(redirectPath);
      } else {
        toast.error(data.detail || 'E-posta veya şifre hatalı');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.name === 'TypeError' && error.message?.includes('fetch')) {
        toast.error('Sunucuya bağlanılamıyor. Demo hesap kullanabilirsiniz.');
      } else {
        toast.error('Giriş sırasında bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGraduateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basit doğrulama
      if (!registrationData.firstName || !registrationData.lastName || !registrationData.email) {
        toast.error('Lütfen gerekli alanları doldurun');
        setIsLoading(false);
        return;
      }

      if (!registrationData.password || !registrationData.confirmPassword) {
        toast.error('Şifre alanları gerekli');
        setIsLoading(false);
        return;
      }

      if (registrationData.password !== registrationData.confirmPassword) {
        toast.error('Şifreler uyuşmuyor');
        setIsLoading(false);
        return;
      }

      if (registrationData.password.length < 6) {
        toast.error('Şifre en az 6 karakter olmalı');
        setIsLoading(false);
        return;
      }

      if (registrationData.primarySkills.length === 0) {
        toast.error('Lütfen en az bir beceri seçin');
        setIsLoading(false);
        return;
      }

      console.log('🚀 Kayıt isteği başlatılıyor...');
      console.log('📝 Form verileri:', registrationData);

      const requestBody = {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        phone: registrationData.phone,
        upschoolProgram: registrationData.bootcampProgram,
        graduationDate: registrationData.graduationYear,
        skills: registrationData.primarySkills,
        experience: registrationData.experienceLevel,
        location: '',
        portfolio: registrationData.portfolioUrl || '',
        github: registrationData.githubUrl || '',
        linkedin: registrationData.linkedinUrl || '',
        aboutMe: '',
        password: registrationData.password
      };

      console.log('📤 API\'ye gönderilen veri:', requestBody);

      // API URL'lerini sırayla dene
      const apiUrls = [
        'http://127.0.0.1:8000/api/auth/graduate/register',
        'http://localhost:8000/api/auth/graduate/register'
      ];

      let response;
      let lastError;

      for (const apiUrl of apiUrls) {
        try {
          console.log(`🔗 Denenen URL: ${apiUrl}`);
          
          response = await fetch(apiUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });
          
          console.log(`✅ ${apiUrl} başarılı - Status:`, response.status);
          break; // Başarılı olursa döngüden çık
          
        } catch (error) {
          console.log(`❌ ${apiUrl} başarısız:`, error);
          lastError = error;
          continue; // Sonraki URL'yi dene
        }
      }

      if (!response) {
        throw lastError || new Error('Tüm API URL\'leri başarısız oldu');
      }

      console.log('🔍 API Response Status:', response.status);
      console.log('🔍 API Response OK:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response Data:', data);
        
        // API'den dönen user data'yı localStorage'a kaydet
        if (data.user) {
          localStorage.setItem('uphera_user', JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            program: data.user.program,
            isLoggedIn: true,
            token: data.token,
            loginAt: new Date().toISOString()
          }));
        }

        toast.success('🎉 Kayıt başarılı! Up Hera\'ya hoş geldin!');
        toast.success('İş ilanlarına yönlendiriliyorsun...');
        
        console.log('✅ Registration Success:', data);
        
        // İş ilanlarına yönlendir
        setTimeout(() => {
          navigate('/jobs');
        }, 1000);

      } else {
        const errorText = await response.text();
        console.error('❌ API Error Response:', response.status, errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          toast.error(errorData.detail || 'Kayıt işlemi başarısız');
        } catch {
          toast.error(`API Hatası: ${response.status} - ${errorText}`);
        }
      }

    } catch (error: any) {
      console.error('❌ Network/Request Error:', error);
      console.error('🔍 Error Type:', error.constructor?.name);
      console.error('🔍 Error Message:', error.message);
      
      if (error.name === 'TypeError' && error.message?.includes('fetch')) {
        toast.error('Sunucuya bağlanılamıyor. API servisinin çalıştığından emin olun.');
      } else if (error.name === 'SyntaxError') {
        toast.error('Sunucudan geçersiz yanıt alındı.');
      } else {
        toast.error(`Bağlantı hatası: ${error.message || 'Bilinmeyen hata'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setRegistrationData(prev => ({
      ...prev,
      primarySkills: prev.primarySkills.includes(skill)
        ? prev.primarySkills.filter(s => s !== skill)
        : [...prev.primarySkills, skill]
    }));
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--up-light-gray)' }}>
      {/* Modern Header with Profile */}
      <div className="up-page-header">
        <div className="up-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BrandLogo size={175} />
              </div>
              <div className="text-right flex-1">
                <h1 className="text-xs md:text-sm font-medium" style={{ color: 'var(--up-dark-gray)' }}>
                  Teknolojide Öncü Kadınlar Topluluğu
                </h1>
              </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="up-container py-16">
        <div className={`mx-auto ${isRegistering ? 'max-w-2xl' : 'max-w-md'}`}>
          {/* Login Card */}
          <div className="up-card p-8 up-fade-in">
            <div className="text-center mb-8">
              {/* Up Hera Logo */}
              <div className="flex justify-center mb-6">
                <BrandLogo size={350} />
              </div>
              <h2 className="up-page-title text-2xl">
                {isRegistering ? 'Hesap Oluştur' : 'Up Hera\'ya Giriş Yap'}
              </h2>
              <p className="up-page-subtitle">
                {isRegistering 
                  ? 'Up Hera – Teknolojide Öncü Kadınlar Topluluğu'
                  : userType === 'mezun' 
                    ? 'Teknolojide Öncü Kadınlar Topluluğu'
                    : 'Admin için yönetim paneli'
                }
              </p>
            </div>

            {/* UpSchool Graduate Registration Form */}
            {isRegistering ? (
              <form onSubmit={handleGraduateRegistration} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="up-form-group">
                    <label className="up-form-label">Ad</label>
                    <input
                      type="text"
                      value={registrationData.firstName}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Adınız"
                      className="up-input"
                      required
                    />
                  </div>
                  <div className="up-form-group">
                    <label className="up-form-label">Soyad</label>
                    <input
                      type="text"
                      value={registrationData.lastName}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Soyadınız"
                      className="up-input"
                      required
                    />
                  </div>
                </div>

                <div className="up-form-group">
                  <label className="up-form-label">E-posta Adresi</label>
                  <input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ornek@email.com"
                    className="up-input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="up-form-group">
                    <label className="up-form-label">Şifre</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={registrationData.password}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Şifreniz"
                        className="up-input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showRegPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div className="up-form-group">
                    <label className="up-form-label">Şifre Tekrar</label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        value={registrationData.confirmPassword}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Şifrenizi tekrar girin"
                        className="up-input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showRegConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="up-form-group">
                  <label className="up-form-label">Telefon</label>
                  <input
                    type="tel"
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+90 555 123 45 67"
                    className="up-input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="up-form-group">
                    <label className="up-form-label">Bootcamp Programı</label>
                    <select
                      value={registrationData.bootcampProgram}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, bootcampProgram: e.target.value }))}
                      className="up-form-select"
                      required
                    >
                      <option value="">Seçiniz</option>
                      <option value="frontend">Frontend Development</option>
                      <option value="backend">Backend Development</option>
                      <option value="fullstack">Full Stack Development</option>
                      <option value="mobile">Mobile Development</option>
                      <option value="data-science">Data Science</option>
                      <option value="ui-ux">UI/UX Design</option>
                      <option value="devops">DevOps</option>
                    </select>
                  </div>
                  <div className="up-form-group">
                    <label className="up-form-label">Mezuniyet Yılı</label>
                    <select
                      value={registrationData.graduationYear}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, graduationYear: e.target.value }))}
                      className="up-form-select"
                      required
                    >
                      <option value="">Seçiniz</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                    </select>
                  </div>
                </div>

                <div className="up-form-group">
                  <label className="up-form-label">Temel Yetenekler</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['React', 'JavaScript', 'TypeScript', 'Python', 'Node.js', 'HTML', 'CSS', 'SQL', 'Git', 'Docker'].map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          registrationData.primarySkills.includes(skill)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="up-form-group">
                  <label className="up-form-label">Deneyim Seviyesi</label>
                  <select
                    value={registrationData.experienceLevel}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className="up-form-select"
                  >
                    <option value="entry">Giriş Seviyesi (0-1 yıl)</option>
                    <option value="junior">Junior (1-3 yıl)</option>
                    <option value="mid">Orta Seviye (3-5 yıl)</option>
                    <option value="senior">Senior (5+ yıl)</option>
                  </select>
                </div>

                <div className="up-form-group">
                  <label className="up-form-label">LinkedIn Profili (Opsiyonel)</label>
                  <input
                    type="url"
                    value={registrationData.linkedinUrl}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/kullanici-adi"
                    className="up-input"
                  />
                </div>

                <div className="up-form-group">
                  <label className="up-form-label">GitHub Profili (Opsiyonel)</label>
                  <input
                    type="url"
                    value={registrationData.githubUrl}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    placeholder="https://github.com/kullanici-adi"
                    className="up-input"
                  />
                </div>

                <div className="up-form-group">
                  <label className="up-form-label">Portfolio Website (Opsiyonel)</label>
                  <input
                    type="url"
                    value={registrationData.portfolioUrl}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                    placeholder="https://portfolio.com"
                    className="up-input"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    ← Geri
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 up-button-primary px-4 py-3"
                  >
                    {isLoading ? 'Kaydediliyor...' : 'Hesap Oluştur'}
                  </button>
                </div>
              </form>
            ) : (
              /* Simple Login Form */
              <form onSubmit={handleLogin} className="space-y-6">
                {/* User Type Selection */}
                <div className="up-form-group">
                  <label className="up-form-label">
                    Hesap Türü
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserType('mezun')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        userType === 'mezun'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-medium">UpSchool Mezunu</div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setUserType('admin')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        userType === 'admin'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-medium">Admin</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Email Input */}
                <div className="up-form-group">
                  <label htmlFor="email" className="up-form-label">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="up-input"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="up-form-group">
                  <label htmlFor="password" className="up-form-label">
                    Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Şifreniz"
                      className="up-input pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="up-button-primary px-8 py-3 text-center"
                    style={{ minWidth: '200px' }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="up-loading"></div>
                        <span>Giriş yapılıyor...</span>
                      </div>
                    ) : (
                      'Giriş Yap'
                    )}
                  </button>
                </div>

                {/* Create Account Link - Only for UpSchool Graduates */}
                {userType === 'mezun' && (
                  <div className="text-center mt-6">
                    <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                      UpSchool mezunu musunuz?{' '}
                      <button
                        type="button"
                        onClick={() => setIsRegistering(true)}
                        className="font-medium hover:underline"
                        style={{ color: 'var(--up-primary)' }}
                      >
                        Hesap Oluştur
                      </button>
                    </p>
                  </div>
                )}
                
                 {/* Contact Info for Admin */}
                {userType === 'admin' && (
                  <div className="text-center mt-6">
                    <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                      Admin hesabı için UpSchool ile iletişime geçin
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--up-primary)' }}>
                      📧 admin@uphera.com
                    </p>
                  </div>
                )}
              </form>
            )}
            {/* Card bottom note */}
            <div className="text-center mt-6">
              <p className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                Teknolojide Öncü Kadınlar Topluluğu
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* UpSchool Stats - Full Width */}
      <div className="py-16" style={{ background: 'var(--up-light-gray)' }}>
        <div className="up-container">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--up-primary)' }}>
              Sayılarla UP School
            </h3>
            <p className="text-lg" style={{ color: 'var(--up-dark-gray)' }}>
              Teknolojide öncü kadınların başarı hikayesi
            </p>
          </div>
          
          {/* Main Statistics with Icons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            {/* Başvuru Sayısı */}
            <div className="text-center p-8 up-card hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--up-primary)' }}>
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--up-primary)' }}>
                30.000+
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--up-dark-gray)' }}>başvuru</div>
            </div>

            {/* Kadın Eğitimi */}
            <div className="text-center p-8 up-card hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--up-primary)' }}>
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C14.5 7 14 7.2 13.6 7.6L11.5 9.7L10.6 8.8C10.2 8.4 9.8 8.2 9.3 8.2H3V10.2H8.7L12 13.5V22H14V13.5L16 11.5V22H18V9H21Z"/>
                </svg>
              </div>
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--up-primary)' }}>
                4.000+
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--up-dark-gray)' }}>kadına teknoloji eğitimi</div>
            </div>

            {/* Program Tamamlama */}
            <div className="text-center p-8 up-card hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--up-primary)' }}>
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"/>
                </svg>
              </div>
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--up-primary)' }}>
                70%
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--up-dark-gray)' }}>program tamamlama oranı</div>
            </div>

            {/* İşe Yerleştirme */}
            <div className="text-center p-8 up-card hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--up-primary)' }}>
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M14,6V4H10V6H8A2,2 0 0,0 6,8V19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V8A2,2 0 0,0 16,6H14M12,2A2,2 0 0,1 14,4V6H10V4A2,2 0 0,1 12,2Z"/>
                </svg>
              </div>
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--up-primary)' }}>
                70%
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--up-dark-gray)' }}>bootcamp mezunlarının işe girme oranı</div>
            </div>
          </div>

          {/* Partner Companies Section */}
          <div className="up-card p-12 text-center">
            <h4 className="text-xl font-bold mb-8" style={{ color: 'var(--up-primary-dark)' }}>
              UP School Mezunlarının Çalıştığı Şirketler
            </h4>
            
            {/* Company Logos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
              {/* Google */}
              <div className="flex flex-col items-center space-y-3 group">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 group-hover:shadow-lg transition-shadow">
                  <svg width="28" height="28" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--up-dark-gray)' }}>Google</span>
              </div>
              
              {/* Microsoft */}
              <div className="flex flex-col items-center space-y-3 group">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 group-hover:shadow-lg transition-shadow">
                  <svg width="28" height="28" viewBox="0 0 24 24">
                    <path fill="#F35325" d="M1 1h10v10H1z"/>
                    <path fill="#81BC06" d="M13 1h10v10H13z"/>
                    <path fill="#05A6F0" d="M1 13h10v10H1z"/>
                    <path fill="#FFBA08" d="M13 13h10v10H13z"/>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--up-dark-gray)' }}>Microsoft</span>
              </div>
              
              {/* Trendyol */}
              <div className="flex flex-col items-center space-y-3 group">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 group-hover:shadow-lg transition-shadow">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--up-dark-gray)' }}>Trendyol</span>
              </div>
              
              {/* Getir */}
              <div className="flex flex-col items-center space-y-3 group">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 group-hover:shadow-lg transition-shadow">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--up-dark-gray)' }}>Getir</span>
              </div>
              
              {/* Hepsiburada */}
              <div className="flex flex-col items-center space-y-3 group">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 group-hover:shadow-lg transition-shadow">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">hb</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--up-dark-gray)' }}>Hepsiburada</span>
              </div>
              
              {/* Spotify */}
              <div className="flex flex-col items-center space-y-3 group">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 group-hover:shadow-lg transition-shadow">
                  <svg width="28" height="28" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#1DB954"/>
                    <path fill="white" d="M17.9 10.9c-3.8-2.2-10-2.4-13.6-1.3-.6.2-1.2-.2-1.4-.8s.2-1.2.8-1.4c4.2-1.2 11.1-1 15.4 1.5.6.3.8 1.1.5 1.7-.3.6-1.1.8-1.7.5zM17.6 14c-.2.5-.8.7-1.3.5-3.2-2-8.1-2.6-11.9-1.4-.5.2-1-.2-1.2-.7s.2-1 .7-1.2c4.3-1.3 9.8-.7 13.4 1.6.5.3.7.9.3 1.4zm-1.5 3.4c-.2.4-.6.5-1 .3-2.8-1.7-6.3-2.1-10.4-1.1-.4.1-.8-.2-.9-.6s.2-.8.6-.9c4.6-1.1 8.4-.6 11.4 1.3.4.2.5.6.3 1z"/>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--up-dark-gray)' }}>Spotify</span>
              </div>
              
              {/* Netflix */}
              <div className="flex flex-col items-center space-y-3 group">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 group-hover:shadow-lg transition-shadow">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">N</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--up-dark-gray)' }}>Netflix</span>
              </div>
              
              {/* Figma */}
              <div className="flex flex-col items-center space-y-3 group">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 group-hover:shadow-lg transition-shadow">
                  <svg width="20" height="28" viewBox="0 0 20 28">
                    <path fill="#1ABCFE" d="M10 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                    <path fill="#0ACF83" d="M2 22a4 4 0 0 0 4 4h4v-8H6a4 4 0 0 0-4 4z"/>
                    <path fill="#FF7262" d="M2 6a4 4 0 0 0 4 4h4V2H6a4 4 0 0 0-4 4z"/>
                    <path fill="#F24E1E" d="M2 14a4 4 0 0 0 4 4h4v-8H6a4 4 0 0 0-4 4z"/>
                    <path fill="#A259FF" d="M2 6a4 4 0 0 0 4 4h4V2H6a4 4 0 0 0-4 4z"/>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--up-dark-gray)' }}>Figma</span>
              </div>
              
              {/* Amazon */}
              <div className="flex flex-col items-center space-y-3 group">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 group-hover:shadow-lg transition-shadow">
                  <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">a</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--up-dark-gray)' }}>Amazon</span>
              </div>
              
              {/* Türk Telekom */}
              <div className="flex flex-col items-center space-y-3 group">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 group-hover:shadow-lg transition-shadow">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">TT</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--up-dark-gray)' }}>Türk Telekom</span>
              </div>
              
              {/* Vodafone */}
              <div className="flex flex-col items-center space-y-3 group">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 group-hover:shadow-lg transition-shadow">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">V</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--up-dark-gray)' }}>Vodafone</span>
              </div>
              
              {/* Akbank */}
              <div className="flex flex-col items-center space-y-3 group">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 group-hover:shadow-lg transition-shadow">
                  <div className="w-8 h-8 bg-red-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--up-dark-gray)' }}>Akbank</span>
              </div>
            </div>

            <div className="mt-8 text-sm" style={{ color: 'var(--up-dark-gray)' }}>
              Ve daha fazlası... Teknoloji sektörünün önde gelen şirketlerinde çalışan mezunlarımız
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t" style={{ borderColor: 'var(--up-light-gray)', background: 'white' }}>
        <div className="up-container">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <BrandLogo size={100} />
            </div>
            <div className="mb-4 text-xs" style={{ color: 'var(--up-dark-gray)' }}>
              Teknolojide Öncü Kadınlar Topluluğu
            </div>
            <div className="flex items-center justify-center space-x-6 text-xs" style={{ color: 'var(--up-dark-gray)' }}>
              <span>© 2025 Up Hera</span>
              <span>•</span>
              <span>UpSchool Partnership</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginScreen; 