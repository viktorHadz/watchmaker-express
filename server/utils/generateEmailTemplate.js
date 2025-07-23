/**
 * Generates HTML and text email templates for watch repair contact form submissions.
 * 
 * @param {Object} formData - Contact form data
 * @param {string} formData.firstName - Customer's first name
 * @param {string} formData.lastName - Customer's last name  
 * @param {string} formData.email - Customer's email
 * @param {string} [formData.phone] - Customer's phone (optional)
 * @param {string} formData.message - Repair inquiry message
 * @param {Array<Object>} [formData.images] - Uploaded images (optional)
 * 
 * @returns {Object} { html: string, text: string } - Email templates
 * 
 * @example
 * generateEmailTemplate({
 *   firstName: "John", lastName: "Smith", 
 *   email: "john@email.com", message: "Watch stopped working"
 * });
 */
export function generateEmailTemplate(formData) {
  const htmlTemplate = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Контакт за ремонт на часовници</title>
      <style type="text/css">
        body { 
          margin: 0; 
          padding: 0; 
          font-family: Georgia, 'Times New Roman', serif; 
          font-size: 16px; 
          line-height: 1.6; 
          color: #2d1810; 
          background-color: #f8f6f1;
          min-height: 100vh;
        }
        table { border-collapse: collapse; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        p { margin: 0; padding: 0; }
        .container { 
          width: 100%; 
          max-width: 700px; 
          margin: 0 auto; 
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e8e2d6;
        }
        .header { 
          background: linear-gradient(135deg, #c9986a 0%, #b8915c 50%, #a67c47 100%);
          color: #f2f0ed; 
          text-align: center; 
          padding: 40px 30px;
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
          pointer-events: none;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600; 
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          letter-spacing: 0.5px;
        }
        .header p {
          margin: 12px 0 0 0; 
          font-size: 15px; 
          opacity: 0.9;
          font-style: italic;
        }
        .content { 
          background: #ffffff; 
          padding: 35px 30px; 
        }
        .card { 
          background: #fbf9f5; 
          border: 1px solid #e8e2d6; 
          margin-bottom: 24px; 
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .card-header { 
          background: #f5f1ea; 
          padding: 20px 25px; 
          border-bottom: 1px solid #e8e2d6; 
        }
        .card-body { 
          padding: 25px; 
        }
        .label { 
          font-weight: bold; 
          color: #5a4c3a; 
          display: inline-block;
          min-width: 90px;
          margin-right: 8px;
        }
        .value { 
          color: #2d1810; 
        }
        .email-link { 
          color: #ae8e4d; 
          text-decoration: none; 
        }
        .email-link:hover {
          color: #8b7240;
        }
        .message-box { 
          background: #fefcf8; 
          padding: 25px; 
          border-left: 4px solid #ae8e4d; 
          white-space: pre-wrap; 
          border-radius: 6px;
          border: 1px solid #f0ebe1;
          color: #2d1810;
        }
        .attachment-badge { 
          background: linear-gradient(135deg, rgba(201, 152, 106, 0.2) 0%, rgba(184, 145, 92, 0.15) 100%); 
          color: #f0c674; 
          padding: 6px 14px; 
          border-radius: 20px; 
          font-size: 13px; 
          font-weight: bold; 
          border: 1px solid #c9986a; 
          display: inline-block;
        }
        .btn { 
          display: inline-block; 
          padding: 14px 28px; 
          margin: 8px; 
          text-decoration: none; 
          font-weight: bold; 
          font-size: 14px; 
          border-radius: 8px; 
          transition: all 0.3s ease;
        }
        .btn-primary { 
          background: #c9986a; 
          color: #f2f0ed; 
        }
        .btn-primary:hover {
          background: #ec9c50ff; 
          color: #ffffffff;
        }
       
        .footer { 
          background: #ae8e4d; 
          color: #fff8f0ff; 
          padding: 25px; 
          text-align: center; 
          font-size: 14px; 
        }
        h2 {
          margin: 0; 
          font-size: 18px; 
          font-weight: 600; 
          color: #2d1810;
        }
      </style>
    </head>
    <body>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td>
            <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td class="header">
                  <h1>⌚ Контакт за ремонт на часовници</h1>
                  <p>Ново запитване получено</p>
                </td>
              </tr>
              
              <tr>
                <td class="content">
                  <table class="card" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td class="card-header">
                        <h2>👤 Данни за контакт</h2>
                      </td>
                    </tr>
                    <tr>
                      <td class="card-body">
                        <p style="margin-bottom: 12px;"><span class="label">Име:</span> <span class="value">${formData.firstName} ${formData.lastName}</span></p>
                        <p style="margin-bottom: 12px;"><span class="label">Имейл:</span> <span class="value">${formData.email}</span></p>
                        ${formData.phone ? `<p style="margin-bottom: 12px;"><span class="label">Телефон:</span> <span class="value">${formData.phone}</span></p>` : ''}
                        ${formData.images && formData.images.length > 0 ? `<p style="margin-bottom: 12px;"><span class="label">Снимки:</span> <span class="value">${formData.images.length} снимк${formData.images.length === 1 ? 'а' : 'и'} прикачен${formData.images.length === 1 ? 'а' : 'и'}</span></p>` : ''}
                      </td>
                    </tr>
                  </table>
                  
                  <table class="card" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td class="card-header">
                        <h2>💬 Съобщение от клиента</h2>
                      </td>
                    </tr>
                    <tr>
                      <td class="card-body">
                        <div class="message-box">${formData.message}</div>
                      </td>
                    </tr>
                  </table>
                  
                  ${formData.images && formData.images.length > 0 ? `
                  <table class="card" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td class="card-header">
                        <h2>📷 Прикачени снимки</h2>
                      </td>
                    </tr>
                    <tr>
                      <td class="card-body">
                        <p style="color: #5a4c3a; margin: 0; font-style: italic;">${formData.images.length} снимк${formData.images.length === 1 ? 'а' : 'и'} са прикачен${formData.images.length === 1 ? 'а' : 'и'} като файлове към този имейл.</p>
                      </td>
                    </tr>
                  </table>` : ''}
                </td>
              </tr>
              
              <tr>
                <td class="footer">
                  <p>Това съобщение е изпратено чрез контактната форма за ремонт на часовници. поздрави Виктор</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const textTemplate = `
ЗАЯВКА ЗА РЕМОНТ НА ЧАСОВНИЦИ
============================

ДАННИ ЗА КОНТАКТ:
Име: ${formData.firstName} ${formData.lastName}
Имейл: ${formData.email}
${formData.phone ? `Телефон: ${formData.phone}` : ''}
${formData.images && formData.images.length > 0 ? `Снимки: ${formData.images.length} снимк${formData.images.length === 1 ? 'а' : 'и'} прикачен${formData.images.length === 1 ? 'а' : 'и'}` : ''}

СЪОБЩЕНИЕ ОТ КЛИЕНТА:
${formData.message}

${formData.images && formData.images.length > 0 ? `
ПРИКАЧЕНИ СНИМКИ:
${formData.images.map((image, index) => `- снимка_${index + 1}.${image.mimetype === 'image/png' ? 'png' : image.mimetype === 'image/webp' ? 'webp' : 'jpg'}`).join('\n')}
` : ''}

---
Това съобщение е изпратено чрез контактната форма на theWatchMaker - поздрави Виктор.
  `

  return { html: htmlTemplate, text: textTemplate }
}

