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
function generateEmailTemplate(formData) {
  const htmlTemplate = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Watch Repair Contact</title>
      <style type="text/css">
        body { margin: 0; padding: 0; font-family: Georgia, serif; font-size: 16px; line-height: 1.6; color: #2d1810; background-color: #fefcf8; }
        table { border-collapse: collapse; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        p { margin: 0; padding: 0; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; }
        .header { background-color: #ae8e4d; color: #fefcf8; text-align: center; padding: 30px 20px; }
        .header h1 { margin: 0; font-size: 24px; font-weight: normal; }
        .content { background-color: #ffffff; padding: 30px 20px; }
        .card { background-color: #fbf9f5; border: 1px solid #e8e2d6; margin-bottom: 20px; }
        .card-header { background-color: #f5f1ea; padding: 15px 20px; border-bottom: 1px solid #e8e2d6; }
        .card-body { padding: 20px; }
        .label { font-weight: bold; color: #5a4c3a; }
        .value { color: #2d1810; }
        .email-link { color: #ae8e4d; text-decoration: none; }
        .message-box { background-color: #fefcf8; padding: 20px; border-left: 4px solid #ae8e4d; white-space: pre-wrap; }
        .attachment-badge { background-color: rgba(174, 142, 77, 0.15); color: #8b7240; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: bold; border: 1px solid #ae8e4d; }
        .btn { display: inline-block; padding: 12px 24px; margin: 8px; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 6px; }
        .btn-primary { background-color: #ae8e4d; color: #fefcf8; }
        .btn-secondary { background-color: #fefcf8; color: #ae8e4d; border: 2px solid #ae8e4d; }
        .footer { background-color: #2d1810; color: #d4c4b0; padding: 20px; text-align: center; font-size: 13px; }
        .image-item { background-color: #f5f1ea; padding: 12px; margin-bottom: 8px; border: 1px solid #e8e2d6; }
      </style>
    </head>
    <body>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td>
            <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td class="header">
                  <h1>⌚ Watch Repair Contact</h1>
                  <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">New submission received</p>
                </td>
              </tr>
              
              <tr>
                <td class="content">
                  <table class="card" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td class="card-header">
                        <h2 style="margin: 0; font-size: 18px; font-weight: normal;">👤 Contact Information</h2>
                      </td>
                    </tr>
                    <tr>
                      <td class="card-body">
                        <p style="margin-bottom: 12px;"><span class="label">Name:</span> <span class="value">${formData.firstName} ${formData.lastName}</span></p>
                        <p style="margin-bottom: 12px;"><span class="label">Email:</span> <a href="mailto:${formData.email}" class="email-link">${formData.email}</a></p>
                        ${formData.phone ? `<p style="margin-bottom: 12px;"><span class="label">Phone:</span> <a href="tel:${formData.phone}" class="email-link">${formData.phone}</a></p>` : ''}
                        ${formData.images && formData.images.length > 0 ? `<p style="margin-bottom: 12px;"><span class="label">Images:</span> <span class="attachment-badge">${formData.images.length} image${formData.images.length !== 1 ? 's' : ''} attached</span></p>` : ''}
                      </td>
                    </tr>
                  </table>
                  
                  <table class="card" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td class="card-header">
                        <h2 style="margin: 0; font-size: 18px; font-weight: normal;">💬 Customer Message</h2>
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
                        <h2 style="margin: 0; font-size: 18px; font-weight: normal;">📷 Attached Images</h2>
                      </td>
                    </tr>
                    <tr>
                      <td class="card-body">
                        ${formData.images.map((image, index) => `
                        <div class="image-item">📎 image_${index + 1}.${image.mimetype === 'image/png' ? 'png' : image.mimetype === 'image/webp' ? 'webp' : 'jpg'}</div>
                        `).join('')}
                      </td>
                    </tr>
                  </table>` : ''}
                  
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center; padding-top: 30px;">
                        <a href="mailto:${formData.email}?subject=Re: Watch Repair Inquiry" class="btn btn-primary">Reply to Customer</a>
                        ${formData.phone ? `<a href="tel:${formData.phone}" class="btn btn-secondary">Call Customer</a>` : ''}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td class="footer">
                  <p>This message was sent through your watch repair contact form.</p>
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
WATCH REPAIR CONTACT FORM SUBMISSION
====================================

CONTACT INFORMATION:
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
${formData.phone ? `Phone: ${formData.phone}` : ''}
${formData.images && formData.images.length > 0 ? `Images: ${formData.images.length} image${formData.images.length !== 1 ? 's' : ''} attached` : ''}

CUSTOMER MESSAGE:
${formData.message}

${formData.images && formData.images.length > 0 ? `
ATTACHED IMAGES:
${formData.images.map((image, index) => `- image_${index + 1}.${image.mimetype === 'image/png' ? 'png' : image.mimetype === 'image/webp' ? 'webp' : 'jpg'}`).join('\n')}
` : ''}

QUICK ACTIONS:
Reply: mailto:${formData.email}?subject=Re: Watch Repair Inquiry
${formData.phone ? `Call: tel:${formData.phone}` : ''}

---
This message was sent via tehWatchMaker Contact Form.
  `

  return { html: htmlTemplate, text: textTemplate }
}

