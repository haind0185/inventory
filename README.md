# Inventory

Ứng dụng desktop **quản lý kho hàng** dành cho doanh nghiệp, chạy trên Windows. Ứng dụng hoạt động hoàn toàn offline trên máy người dùng: toàn bộ dữ liệu được lưu trong **SQLite** cục bộ và có cơ chế **tự động cập nhật** qua GitHub Releases.

## Kiến trúc

Đây là một ứng dụng full-stack được đóng gói trong một desktop app:

- **Electron** — khung desktop. Khi khởi động, tiến trình chính (`src/main.js`) sẽ bật một **server Express ngay trên `localhost:1603`**.
- **Frontend (Vue 3)** — chạy trong cửa sổ Electron, gọi REST API tới server Express cục bộ.
- **Backend (Express + Sequelize)** — xử lý nghiệp vụ và truy xuất database SQLite. Migration tự động chạy mỗi khi ứng dụng khởi động để đảm bảo schema luôn cập nhật.

```
┌─────────────────────── Electron ───────────────────────┐
│                                                         │
│  Renderer (Vue 3 + Pinia + Vue Router + Tailwind)       │
│        │  axios → http://localhost:1603                 │
│        ▼                                                │
│  Express server (Sequelize ORM)  ──►  SQLite (local)    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Công nghệ sử dụng

| Lớp | Công nghệ |
|-----|-----------|
| Desktop / Build | Electron 24, Electron Forge, Vite 4, electron-builder, electron-updater |
| Frontend | Vue 3 (`<script setup>`), Pinia, Vue Router 4, Vue I18n, Tailwind CSS 3, Axios |
| Backend | Express 4, Sequelize 6, sqlite3, Umzug (migration), Joi (validation), Multer (upload) |
| Excel | xlsx, xlsx-style, exceljs |
| Khác | moment, electron-log |

## Chức năng

- **Mặt hàng (Products)** — quản lý danh mục sản phẩm (mã, tên, đơn giá, đơn vị, quy cách, HSD), thêm/sửa/xóa và import từ file Excel.
- **Nhập kho (Entry)** — lập phiếu nhập, theo dõi hạn sử dụng từng lô hàng, xem nhập theo mặt hàng / theo ngày.
- **Xuất kho (Exit)** — lập phiếu xuất, kiểm tra tồn đủ số lượng, xem xuất theo mặt hàng / theo ngày.
- **Tồn kho (Inventory)** — xem tồn kho hiện tại, tồn kho theo mặt hàng, tổng hợp tồn kho, **tồn kho an toàn (safety stock)**, và **kiểm kho (stocktaking)** bằng file Excel.
- **So sánh (Compare)** — đối chiếu dữ liệu.
- **Đại lý (Agents)** — quản lý đại lý (mã, tên, địa chỉ, tọa độ), import từ Excel.
- **Bán hàng (Sale-Off)** — phân hệ bán hàng đầy đủ: sản phẩm, nhân viên sale, nhân viên giao hàng, khách hàng, đơn hàng, nhập kho, tồn kho và các báo cáo (theo khách hàng / nhân viên sale / nhân viên giao hàng).
- **Dashboard** — màn hình tổng quan, sticky note.
- **Xuất / nhập Excel** — nhiều màn hình hỗ trợ import dữ liệu và xuất báo cáo ra Excel.

Giao diện và dữ liệu hiển thị bằng **tiếng Việt** (Vue I18n).

## Yêu cầu môi trường

- **Node.js** (khuyến nghị bản LTS) và npm
- Windows (build mặc định nhắm tới Windows; Forge có cấu hình sẵn maker cho macOS/Linux nhưng chưa được dùng chính)

## Cài đặt

```bash
npm install
```

Tạo file `.env` ở thư mục gốc (tham khảo `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:1603   # URL frontend dùng để gọi API
CERT_PASSWORD=...                          # mật khẩu chứng chỉ ký (cert.pfx) — chỉ cần khi build/publish
GITHUB_TOKEN=github_pat_...                # token GitHub có quyền repo — chỉ cần khi publish
```

> `CERT_PASSWORD` và `GITHUB_TOKEN` chỉ cần khi đóng gói/phát hành. Để chạy dev chỉ cần `VITE_API_BASE_URL`.

## Chạy (dev)

```bash
npm run start
```

Lệnh này khởi động Electron Forge ở chế độ dev: bật server Express trên `localhost:1603`, build renderer bằng Vite (hot reload) và mở cửa sổ ứng dụng.

> Lưu ý: ứng dụng yêu cầu port **1603** trống. Nếu port đang bị chiếm, ứng dụng sẽ tự thoát. Có thể nhấn **Ctrl+E** trong app để khởi động lại server.

## Build (đóng gói)

```bash
# Đóng gói ứng dụng (chưa tạo installer)
npm run package

# Tạo file cài đặt (installer/zip) cho nền tảng hiện tại
npm run make
```

Sản phẩm build nằm trong thư mục `out/`. Trên Windows, maker Squirrel sẽ tạo file `Setup.exe` (có hỗ trợ auto-update) — quá trình này dùng chứng chỉ `cert.pfx` với mật khẩu lấy từ `CERT_PASSWORD`.

## Ký ứng dụng (code signing)

App được ký bằng chứng chỉ tự ký `cert.pfx` (cấu hình trong `forge.config.js` → maker Squirrel). Maker đọc **thẳng file `cert.pfx`** với mật khẩu `CERT_PASSWORD`, **không cần cài chứng chỉ vào Windows Certificate Store**.

`cert.pfx` đã có sẵn trong repo, nên **bình thường không cần làm gì** — chỉ cần `.env` có `CERT_PASSWORD` đúng.

### Tạo lại cert.pfx

Chỉ cần khi mất file hoặc muốn làm chứng chỉ mới. Chạy script (từ thư mục gốc project):

```bash
powershell -ExecutionPolicy Bypass -File scripts/generate-cert.ps1
# hoặc đổi mật khẩu:
powershell -ExecutionPolicy Bypass -File scripts/generate-cert.ps1 -Password "mat_khau_moi"
```

Script `scripts/generate-cert.ps1` thực hiện 3 bước:

1. `New-SelfSignedCertificate` — tạo chứng chỉ code-signing trong `Cert:\CurrentUser\My`.
2. Lấy đúng chứng chỉ vừa tạo (mới nhất nếu trùng tên).
3. `Export-PfxCertificate` — xuất ra file `cert.pfx` (có đặt mật khẩu).

Nếu muốn làm tay không qua script, đây là các lệnh PowerShell tương đương:

```powershell
New-SelfSignedCertificate -Type CodeSigning -Subject "CN=Inventory" -KeyUsage DigitalSignature `
    -FriendlyName "Inventory Certificate" -CertStoreLocation "Cert:\CurrentUser\My"

$cert = Get-ChildItem -Path Cert:\CurrentUser\My\ |
    Where-Object { $_.FriendlyName -eq "Inventory Certificate" } |
    Sort-Object NotBefore -Descending | Select-Object -First 1

Export-PfxCertificate -Cert $cert -FilePath "cert.pfx" `
    -Password (ConvertTo-SecureString -String "inventory_password" -Force -AsPlainText)
```

Sau khi tạo lại:

- Đặt `CERT_PASSWORD` trong `.env` **khớp** với mật khẩu đã dùng (mặc định `inventory_password`).
- `cert.pfx` đang được commit trong repo, nên commit lại file mới để máy deploy khác cũng có:
  ```bash
  git add cert.pfx && git commit -m "build: regenerate signing cert"
  ```

> Lưu ý: đây là chứng chỉ **tự ký**, nên Windows SmartScreen vẫn có thể cảnh báo trên máy người dùng khác. Tạo cert mới không ảnh hưởng auto-update (Squirrel không kiểm tra tính liên tục của chữ ký). Muốn hết cảnh báo hoàn toàn cần mua chứng chỉ từ CA được tin cậy.

## Publish (phát hành + auto-update)

Đảm bảo file `.env` đã có `GITHUB_TOKEN` (Personal Access Token có quyền `repo`) và `CERT_PASSWORD`. Sau đó chỉ cần:

```bash
npm run publish
```

`forge.config.js` tự nạp `.env` (qua `dotenv`), nên **không cần** set biến môi trường thủ công như `$env:GITHUB_TOKEN=...` mỗi lần. Lệnh này build, ký app và **đẩy bản phát hành lên GitHub Releases** (`haind0185/inventory`) thông qua `@electron-forge/publisher-github`.

> Muốn xem log chi tiết khi publish: `$env:DEBUG="electron-forge:*"; npm run publish` (chỉ để debug, không bắt buộc).

Ứng dụng đã cài trên máy người dùng sẽ tự kiểm tra và tải bản cập nhật mới từ GitHub Releases (cấu hình `update-electron-app` / `electron-updater` trong `src/main.js`). Khi có bản mới, người dùng được thông báo để cài đặt và khởi động lại.

## Tăng phiên bản

`package.json` là **nguồn version duy nhất** — `forge.config.js` (tên file `setupExe`) và `index.html` (tiêu đề cửa sổ) tự lấy theo, không cần sửa tay. Mỗi lần phát hành chỉ cần chạy:

```bash
npm version patch    # 1.0.6 → 1.0.7  (sửa lỗi)
npm version minor    # 1.0.6 → 1.1.0  (thêm tính năng)
npm version major    # 1.0.6 → 2.0.0  (thay đổi lớn)
```

Lệnh này tự sửa `version` trong `package.json`, tạo commit và git tag tương ứng (ví dụ `v1.0.7`). (Thêm `--no-git-tag-version` nếu chỉ muốn đổi số mà không tự commit/tag.)

> Lưu ý: `npm version` yêu cầu cây git phải sạch (đã commit hết thay đổi) trước khi chạy.

### Đẩy lên remote

Sau khi bump version, đẩy cả commit lẫn tag lên GitHub:

```bash
git push origin route --follow-tags
```

- `route` là branch hiện tại.
- `--follow-tags` đẩy kèm các annotated tag (như `v1.0.9`) gắn trên commit được push.
- Nếu tag chưa được đẩy lên, đẩy riêng: `git push origin v1.0.9`.

### Xử lý lỗi "tag already exists"

Nếu `npm version` báo `fatal: tag 'vX.Y.Z' already exists`, nghĩa là đã có tag trùng tên (thường là tag rác trỏ nhầm commit). Kiểm tra và dọn:

```bash
git tag -l "v*"                 # xem các tag local
git ls-remote --tags origin     # xem tag nào đã có trên remote
git log -1 --oneline <tag>      # xem tag trỏ vào commit nào
```

Nếu là tag rác (chưa có trên remote, trỏ sai commit), xóa rồi tạo lại đúng HEAD:

```bash
git tag -d vX.Y.Z               # xóa tag local
git tag -a vX.Y.Z -m "X.Y.Z"    # tạo lại trỏ vào commit hiện tại
```

Sau đó build/publish như bình thường.

## Hướng dẫn sử dụng nhanh

1. Mở ứng dụng — màn hình mặc định là **Dashboard**.
2. Vào **Mặt hàng** để khai báo danh mục sản phẩm (nhập tay hoặc import Excel).
3. Tạo phiếu **Nhập kho** để đưa hàng vào kho (kèm hạn sử dụng).
4. Tạo phiếu **Xuất kho** khi xuất hàng — hệ thống kiểm tra tồn đủ số lượng.
5. Theo dõi **Tồn kho** (tồn hiện tại, tồn an toàn) và định kỳ **kiểm kho** bằng file Excel.
6. Dùng phân hệ **Bán hàng (Sale-Off)** để quản lý đơn hàng, khách hàng, nhân viên và xem báo cáo.

## Cấu trúc thư mục

```
backend/            # Server Express
  controllers/      # Xử lý nghiệp vụ từng module
  models/           # Model Sequelize
  routes/           # Định nghĩa REST API
  migrations/       # Migration database (chạy tự động lúc khởi động)
src/
  main.js           # Tiến trình chính Electron (bật server, cửa sổ, auto-update)
  preload.js        # Cầu nối IPC giữa main và renderer
  renderer/         # Ứng dụng Vue 3
    api/            # Cấu hình axios
    store/          # Pinia store theo từng module
    router/         # Vue Router
    views/          # Các màn hình (theo nghiệp vụ)
    i18n/           # Bản dịch (tiếng Việt)
forge.config.js     # Cấu hình Electron Forge (maker, publisher, vite)
```
