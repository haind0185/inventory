# Tạo chứng chỉ code-signing tự ký và xuất ra cert.pfx.
# CHỈ chạy MỘT LẦN để tạo file cert.pfx (file này dùng để ký app khi publish).
# KHÔNG cần chạy lại mỗi lần deploy — maker Squirrel đọc thẳng cert.pfx.
#
# Cách dùng (từ thư mục gốc project):
#   powershell -ExecutionPolicy Bypass -File scripts/generate-cert.ps1
# Hoặc đổi mật khẩu:
#   powershell -ExecutionPolicy Bypass -File scripts/generate-cert.ps1 -Password "mat_khau_moi"

param(
    [string]$Password = "inventory_password",
    [string]$Subject = "CN=Inventory",
    [string]$FriendlyName = "Inventory Certificate",
    [string]$OutFile = "cert.pfx"
)

$ErrorActionPreference = "Stop"

# 1. Tạo chứng chỉ code-signing trong CurrentUser store
New-SelfSignedCertificate -Type CodeSigning -Subject $Subject -KeyUsage DigitalSignature `
    -FriendlyName $FriendlyName -CertStoreLocation "Cert:\CurrentUser\My" | Out-Null

# 2. Lấy đúng chứng chỉ vừa tạo (mới nhất nếu có nhiều cert trùng tên)
$cert = Get-ChildItem -Path Cert:\CurrentUser\My\ |
    Where-Object { $_.FriendlyName -eq $FriendlyName } |
    Sort-Object NotBefore -Descending |
    Select-Object -First 1

if (-not $cert) { throw "Không tìm thấy chứng chỉ '$FriendlyName'." }

# 3. Xuất ra file PFX (dùng cho forge.config.js -> maker-squirrel)
Export-PfxCertificate -Cert $cert -FilePath $OutFile `
    -Password (ConvertTo-SecureString -String $Password -Force -AsPlainText) | Out-Null

Write-Host "Da tao '$OutFile' (Subject=$Subject)."
Write-Host "Nho dat 'CERT_PASSWORD=$Password' trong file .env de buoc ky app doc duoc mat khau."
