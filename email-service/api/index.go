package handler

import (
	"html/template"
	"net/http"
	"os"

	"bytes"
	"time"

	gomail "gopkg.in/gomail.v2"
)

var htmlTemplate = `
<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; color: #333; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <h2 style="color: #0d6efd; text-align: center;">Verify Your Account</h2>
    <p>Hi there,</p>
    <p>Thanks for signing up with <strong>Ife-Elroiglobal</strong>! Please verify your email to complete your account setup and start enjoying our services — buy data, airtime, pay bills and more.</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{.VerificationLink}}" style="background-color: #0d6efd; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Verify My Account
        </a>
    </div>

    <p>If you didn’t create an account with us, you can safely ignore this email.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />

    <footer style="text-align: center; font-size: 12px; color: #888;">
        &copy; {{.Year}} Ife-Elroiglobal. All rights reserved.<br/>
        <a href="{{.FrontendDomain}}" style="color: #0d6efd; text-decoration: none;">Visit our website</a>
    </footer>
</div>
`

type TemplateData struct {
	VerificationLink string
	FrontendDomain   string
	Year             int
}

func Handler(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")
	verificationLink := r.URL.Query().Get("link")

	if email == "" || verificationLink == "" {
		http.Error(w, "Missing email or link query params", http.StatusBadRequest)
		return
	}

	tmpl, err := template.New("email").Parse(htmlTemplate)
	if err != nil {
		http.Error(w, "Template parsing error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	data := TemplateData{
		VerificationLink: verificationLink,
		FrontendDomain:   os.Getenv("FRONTEND_DOMAIN"),
		Year:             time.Now().Year(),
	}

	var body string
	buf := new(bytes.Buffer)
	if err := tmpl.Execute(buf, data); err != nil {
		http.Error(w, "Template execution error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	body = buf.String()

	m := gomail.NewMessage()
	m.SetHeader("From", os.Getenv("SMTP_USER"))
	m.SetHeader("To", email)
	m.SetHeader("Subject", "Account Verification Process")
	m.SetBody("text/html", body)

	d := gomail.NewDialer("smtp.gmail.com", 587, os.Getenv("SMTP_USER"), os.Getenv("SMTP_PASS"))

	if err := d.DialAndSend(m); err != nil {
		http.Error(w, "Failed to send email: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Email sent successfully to " + email))
}
