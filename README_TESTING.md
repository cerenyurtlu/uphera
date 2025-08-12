# 🧪 Up Hera Test Dokümantasyonu

## 📋 Test Yapısı Genel Bakış

Up Hera projesinde kapsamlı test yapısı kurulmuştur. Bu dokümantasyon test kategorilerini, çalıştırma yöntemlerini ve CI/CD pipeline'ını açıklar.

## 🎯 Test Kategorileri

### 1. **Unit Tests** (`test_api.py`)
- ✅ **Authentication** - Giriş, kayıt, çıkış testleri
- ✅ **Profile Management** - Profil CRUD işlemleri
- ✅ **Health Checks** - Sistem sağlık kontrolleri
- ✅ **Error Handling** - Hata senaryoları
- ✅ **Security** - Güvenlik kontrolleri

### 2. **WebSocket Tests** (`test_websocket.py`)
- ✅ **Connection Management** - Bağlantı kurma/kesme
- ✅ **Room Management** - Oda yönetimi
- ✅ **Message Broadcasting** - Mesaj yayını
- ✅ **Multiple Connections** - Çoklu bağlantı testleri
- ✅ **Performance** - WebSocket performansı

### 3. **AI Streaming Tests** (`test_streaming.py`)
- ✅ **Streaming Response** - Akış yanıtları
- ✅ **Non-streaming Fallback** - Fallback mekanizması
- ✅ **Error Handling** - Hata yönetimi
- ✅ **Performance** - Streaming performansı
- ✅ **Edge Cases** - Sınır durumlar

### 4. **Integration Tests** (`test_integration.py`)
- ✅ **Complete User Journey** - Tam kullanıcı akışı
- ✅ **AI Integration Flow** - AI entegrasyonu
- ✅ **WebSocket Integration** - WebSocket entegrasyonu
- ✅ **Job System** - İş sistemi entegrasyonu
- ✅ **Error Propagation** - Hata yayılımı

### 5. **Load Tests** (`test_load.py`)
- ✅ **High Load Scenarios** - Yüksek yük senaryoları
- ✅ **Concurrent Users** - Eşzamanlı kullanıcılar
- ✅ **WebSocket Load** - WebSocket yük testleri
- ✅ **Memory/CPU Usage** - Kaynak kullanımı
- ✅ **Database Performance** - Veritabanı performansı

## 🚀 Test Çalıştırma

### Hızlı Başlangıç

```bash
# Tüm testleri çalıştır
./scripts/run_tests.sh all

# Sadece hızlı testler
./scripts/run_tests.sh fast

# Belirli kategori
./scripts/run_tests.sh unit
```

### Manuel Test Çalıştırma

```bash
cd api

# Tek kategori
python -m pytest tests/test_api.py -v

# Belirli test fonksiyonu
python -m pytest tests/test_api.py::TestAuthentication::test_login_success -v

# Coverage ile
python -m pytest tests/ --cov=. --cov-report=html
```

### Test Kategorisi Seçenekleri

| Komut | Açıklama | Süre |
|-------|----------|------|
| `unit` | Unit testler | ~30 saniye |
| `websocket` | WebSocket testleri | ~1 dakika |
| `streaming` | AI streaming testleri | ~1 dakika |
| `integration` | Entegrasyon testleri | ~2 dakika |
| `load` | Yük testleri | ~5-10 dakika |
| `fast` | Hızlı testler (unit+websocket+streaming) | ~2 dakika |
| `all` | Tüm testler | ~10-15 dakika |
| `coverage` | Coverage analizi ile | +2 dakika |

## 📊 Test Sonuçları ve Metrikler

### Başarı Kriterleri

**Unit Tests:**
- ✅ %100 başarı oranı
- ✅ <2s ortalama yanıt süresi

**WebSocket Tests:**
- ✅ >%95 bağlantı başarısı
- ✅ <1s broadcast süresi

**AI Streaming Tests:**
- ✅ >%90 streaming başarısı
- ✅ <3s ortalama yanıt

**Load Tests:**
- ✅ 50+ eşzamanlı kullanıcı
- ✅ <200MB bellek kullanımı
- ✅ >%95 başarı oranı

## 🔧 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
- Unit Tests (Python 3.11, 3.12)
- WebSocket Tests
- Streaming Tests  
- Integration Tests
- Load Tests (sadece main branch)
- Coverage Analysis
- Frontend Tests
- Security Scans
```

### Pipeline Adımları

1. **🧪 Paralel Test Execution**
   - 4 test kategorisi paralel çalışır
   - 2 Python versiyonu test edilir

2. **🚀 Load Testing**
   - Sadece main branch'de çalışır
   - Production-ready kontrolü

3. **📊 Coverage Analysis**
   - Test kapsama analizi
   - Codecov entegrasyonu

4. **🟢 Frontend Testing**
   - React build testi
   - Linting kontrolü

5. **🔒 Security Scanning**
   - Bandit security scan
   - Safety dependency check

## 📈 Test Coverage

### Hedef Coverage Oranları

- **Backend API:** >%90
- **WebSocket Service:** >%85
- **AI Service:** >%80
- **Database Layer:** >%95

### Coverage Raporu

```bash
# Coverage raporu oluştur
./scripts/run_tests.sh coverage

# HTML raporu: htmlcov/index.html
open htmlcov/index.html
```

## 🛠️ Test Geliştirme

### Yeni Test Ekleme

1. **Test dosyası oluştur:**
```python
# tests/test_new_feature.py
import pytest
from fastapi.testclient import TestClient
from ..main import app

client = TestClient(app)

class TestNewFeature:
    def test_new_functionality(self):
        # Test kodunuz
        pass
```

2. **Test kategorisi ekle:**
```bash
# pytest.ini'ye marker ekle
markers =
    new_feature: New feature tests
```

3. **CI/CD'ye ekle:**
```yaml
# .github/workflows/test.yml
strategy:
  matrix:
    test-category: [unit, websocket, streaming, integration, new_feature]
```

### Mock Kullanımı

```python
# AI Service mock
@pytest.fixture
def mock_ai_service():
    with patch('api.services.enhanced_ai_service.enhanced_ai_service') as mock:
        async def mock_response():
            yield "Mock AI response"
        mock.enhanced_chat.return_value = mock_response()
        yield mock

# WebSocket mock
@pytest.fixture
def mock_websocket():
    mock_ws = MagicMock()
    return mock_ws
```

## 🚨 Troubleshooting

### Yaygın Sorunlar

**1. Database Connection Errors:**
```bash
# Test database'i temizle
rm -f test_uphera.db
cd api && python -c "from database import init_db; init_db()"
```

**2. WebSocket Connection Issues:**
```python
# Cleanup WebSocket connections
manager.active_connections.clear()
manager.rooms.clear()
```

**3. Memory Leaks in Load Tests:**
```bash
# Test sonrası cleanup
pytest tests/test_load.py --tb=short -s
```

**4. AI Service Timeouts:**
```python
# Mock AI service için timeout artır
@patch.object(enhanced_ai_service, 'enhanced_chat')
async def mock_chat_with_delay():
    await asyncio.sleep(0.1)  # Kısa delay
    yield "Response"
```

### Debug Modunda Test

```bash
# Verbose output ile
python -m pytest tests/ -v -s --tb=long

# Tek test debug
python -m pytest tests/test_api.py::TestAuthentication::test_login_success -v -s --pdb
```

## 📝 Test Yazma Best Practices

### 1. **Test Organizasyonu**
```python
class TestFeatureName:
    """Test specific feature"""
    
    @pytest.fixture
    def setup_data(self):
        """Setup test data"""
        return {"key": "value"}
    
    def test_positive_case(self, setup_data):
        """Test expected behavior"""
        pass
    
    def test_negative_case(self, setup_data):
        """Test error handling"""
        pass
    
    def test_edge_case(self, setup_data):
        """Test boundary conditions"""
        pass
```

### 2. **Assertion Patterns**
```python
# Status code + content
assert response.status_code == 200
assert response.json()["success"] is True

# Timing assertions
assert response_time < 1.0

# Database state
user = get_user_by_id(user_id)
assert user["status"] == "active"
```

### 3. **Mock Strategy**
```python
# External API calls - MOCK
with patch.object(openai_client, 'chat.completions.create'):
    pass

# Database operations - REAL (test DB)
user = create_user(test_data)
assert user is not None

# WebSocket connections - MOCK
mock_websocket = MagicMock()
```

## 🎯 Performans Benchmarkları

### API Endpoint Benchmarks

| Endpoint | Ortalama Yanıt | %95 Percentile | RPS |
|----------|----------------|----------------|-----|
| `/health/` | 50ms | 100ms | 200 |
| `/api/auth/login` | 150ms | 300ms | 100 |
| `/api/jobs` | 200ms | 400ms | 80 |
| `/ai-coach/chat` | 800ms | 1500ms | 20 |
| `/ai-coach/chat/stream` | 1200ms | 2000ms | 15 |

### WebSocket Benchmarks

| Metrik | Değer |
|--------|-------|
| Eşzamanlı Bağlantı | 1000+ |
| Mesaj/Saniye | 500+ |
| Broadcast Süresi (100 user) | <200ms |
| Bellek Kullanımı/Bağlantı | <1MB |

## 🚀 Production Testing

### Staging Environment
```bash
# Staging testleri
ENVIRONMENT=staging ./scripts/run_tests.sh integration

# Load test staging
ENVIRONMENT=staging ./scripts/run_tests.sh load
```

### Monitoring ve Alerting
- **Response Time:** <2s average
- **Error Rate:** <1%
- **Memory Usage:** <512MB
- **CPU Usage:** <70%
- **WebSocket Connections:** Monitored

---

## 📞 Destek

Test sorunları için:
1. GitHub Issues'da issue açın
2. Test loglarını ekleyin
3. Repro adımlarını belirtin

**Happy Testing! 🧪✨**
