"""
Email Service for Up Hera
Güvenli Giriş ve Notification emails
"""

import os
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # For demo purposes, we'll use console logging
        # In production, you'd use SendGrid, AWS SES, etc.
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.email_user = os.getenv("EMAIL_USER", "uphera@example.com")
        self.email_password = os.getenv("EMAIL_PASSWORD", "")
        self.base_url = os.getenv("BASE_URL", "http://localhost:5173")
        
    async def send_secure_login_link(self, email: str, user_type: str) -> bool:
        """Güvenli giriş linki gönder"""
        try:
            # Güvenli token oluştur
            secure_token = str(uuid.uuid4())
            login_link = f"{self.base_url}/auth/verify?token={secure_token}&email={email}&type={user_type}"
            
            # Email içeriği oluştur
            subject = "Up Hera - Güvenli Giriş Linkiniz"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #3A4EFF 0%, #202B7C 100%); color: white; }}
                    .header {{ padding: 40px; text-align: center; }}
                    .content {{ background: white; color: #333; padding: 40px; }}
                    .button {{ display: inline-block; background: linear-gradient(135deg, #3A4EFF 0%, #202B7C 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }}
                    .footer {{ padding: 20px; text-align: center; font-size: 12px; opacity: 0.8; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Up Hera</h1>
                        <p>UpSchool mezunu teknolojide öncü kadınlar için AI destekli platform</p>
                    </div>
                    <div class="content">
                        <h2>Hoş Geldin!</h2>
                         <p>Up Hera'ya giriş yapmak için aşağıdaki güvenli linke tıkla:</p>
                        
                        <div style="text-align: center;">
                            <a href="{login_link}" class="button">
                                Güvenli Giriş Yap
                            </a>
                        </div>
                        
                        <p><strong>Kullanıcı Tipi:</strong> {self._get_user_type_label(user_type)}</p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                        
                         <h3>Up Hera ile Neler Yapabilirsin?</h3>
                        <ul>
                            <li><strong>AI Eşleştirme:</strong> 87-96% doğrulukla iş fırsatları</li>
                            <li><strong>UpSchool Network:</strong> Mezun topluluğuna erişim</li>
                            <li><strong>Otomatik Pitch:</strong> Kişiselleştirilmiş tanıtım e-postaları</li>
                            <li><strong>Real-time Bildirimler:</strong> Anında fırsat bildirimleri</li>
                        </ul>
                        
                        <p style="margin-top: 30px; font-size: 14px; color: #666;">
                            Bu link 24 saat geçerlidir. Güvenlik nedeniyle sadece bu e-posta adresinden kullanılabilir.
                        </p>
                    </div>
                    <div class="footer">
                         <p>Up Hera - Teknolojide öncü kadınların gücüyle iş dünyasını değiştiriyoruz</p>
                        <p>#WomenInTech #UpSchool #DiversityInTech</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Demo için console'a yazdır
            print(f"\nGÜVENLİ GİRİŞ LİNKİ GÖNDERILDI: {email}")
            print(f"Subject: {subject}")
            print(f"Giriş Linki: {login_link}")
            print(f"User Type: {self._get_user_type_label(user_type)}")
            print(f"Geçerlilik: 24 saat")
            print("=" * 60)
            
            # Log to file for debugging
            logger.info(f"Secure login link sent to {email}: {login_link}")
            
            # In production, uncomment this for real email sending:
            # await self._send_email(email, subject, html_content)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send secure login link to {email}: {str(e)}")
            return False
    
    def _get_user_type_label(self, user_type: str) -> str:
        """Kullanıcı tipi labelları"""
        labels = {
            "mezun": "UpSchool Mezunu",
            "isveren": "İşveren",
            "placement": "UpSchool Placement"
        }
        return labels.get(user_type, "Kullanıcı")
    
    async def send_match_notification(self, candidate_email: str, job_title: str, company: str, match_score: int) -> bool:
        """Eşleşme bildirimi gönder"""
        try:
            subject = f"Yeni Eşleşme: {job_title} - {company} ({match_score}% uyum)"
            
            # Demo için console log
            print(f"\nMATCH NOTIFICATION SENT TO: {candidate_email}")
            print(f"Subject: {subject}")
            print(f"Company: {company}")
            print(f"Position: {job_title}")
            print(f"Match Score: {match_score}%")
            print("=" * 60)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send match notification: {str(e)}")
            return False
    
    async def send_application_notification(self, hr_email: str, candidate_name: str, position: str) -> bool:
        """Başvuru bildirimi gönder"""
        try:
            subject = f"Yeni Başvuru: {candidate_name} - {position}"
            
            # Demo için console log
            print(f"\nAPPLICATION NOTIFICATION SENT TO: {hr_email}")
            print(f"Subject: {subject}")
            print(f"Candidate: {candidate_name}")
            print(f"Position: {position}")
            print("=" * 60)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send application notification: {str(e)}")
            return False
    
    async def _send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Gerçek email gönderme (production için)"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.email_user
            msg['To'] = to_email
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # SMTP ile gönder
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email_user, self.email_password)
                server.send_message(msg)
            
            return True
            
        except Exception as e:
            logger.error(f"SMTP error: {str(e)}")
            return False

# Global instance
email_service = EmailService() 