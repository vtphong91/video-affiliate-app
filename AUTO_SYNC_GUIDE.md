# 🔄 Hướng Dẫn Auto-Sync Code Lên GitHub

Hệ thống tự động sync code lên GitHub mà không cần thao tác thủ công.

## 📋 Mục Lục

1. [GitHub Actions Auto-Sync (Khuyến nghị)](#1-github-actions-auto-sync-khuyến-nghị)
2. [Script Local Auto-Sync](#2-script-local-auto-sync)
3. [File Watcher Auto-Sync](#3-file-watcher-auto-sync-nâng-cao)
4. [So Sánh Các Phương Án](#-so-sánh-các-phương-án)

---

## 1. GitHub Actions Auto-Sync (Khuyến nghị) ⭐

### ✅ Ưu điểm
- Hoàn toàn tự động, không cần máy tính bật
- Chạy trên cloud (GitHub Actions)
- Miễn phí (2000 phút/tháng cho tài khoản GitHub miễn phí)
- Không ảnh hưởng đến hiệu năng máy local

### 📝 Cách Hoạt Động
File: `.github/workflows/auto-sync.yml`

**Workflow tự động:**
- Chạy mỗi 6 giờ (0:00, 6:00, 12:00, 18:00 UTC)
- Kiểm tra có thay đổi mới không
- Tự động commit và push nếu có thay đổi
- Retry 4 lần với exponential backoff nếu push fail

### 🚀 Cách Sử Dụng

#### Phương pháp 1: Chạy tự động theo lịch
Workflow sẽ tự động chạy mỗi 6 giờ. Bạn không cần làm gì cả!

#### Phương pháp 2: Trigger thủ công
1. Vào GitHub repository
2. Chọn tab **Actions**
3. Chọn workflow **Auto Sync to GitHub**
4. Click **Run workflow**
5. (Tùy chọn) Nhập commit message tùy chỉnh
6. Click **Run workflow** để confirm

![GitHub Actions Workflow](https://docs.github.com/assets/cb-32937/images/help/actions/workflow-dispatch-button.png)

### ⚙️ Tùy Chỉnh

**Thay đổi tần suất sync:**

Mở file `.github/workflows/auto-sync.yml` và chỉnh sửa cron schedule:

```yaml
on:
  schedule:
    # Chạy mỗi 6 giờ (hiện tại)
    - cron: '0 */6 * * *'

    # Các lựa chọn khác:
    # - cron: '0 */3 * * *'   # Mỗi 3 giờ
    # - cron: '0 */12 * * *'  # Mỗi 12 giờ
    # - cron: '0 0 * * *'     # Mỗi ngày lúc 0:00 UTC
    # - cron: '*/30 * * * *'  # Mỗi 30 phút
```

**Cron syntax:**
```
┌───────────── phút (0 - 59)
│ ┌───────────── giờ (0 - 23)
│ │ ┌───────────── ngày trong tháng (1 - 31)
│ │ │ ┌───────────── tháng (1 - 12)
│ │ │ │ ┌───────────── ngày trong tuần (0 - 6) (0 = Chủ Nhật)
│ │ │ │ │
* * * * *
```

### 🔍 Kiểm Tra Log

1. Vào GitHub repository > **Actions**
2. Chọn workflow run gần nhất
3. Click vào job **auto-sync**
4. Xem log chi tiết từng step

---

## 2. Script Local Auto-Sync

### ✅ Ưu điểm
- Kiểm soát hoàn toàn
- Sync ngay lập tức khi muốn
- Tùy chỉnh commit message dễ dàng

### 📝 Cách Sử Dụng

#### Trên Linux/Mac:

```bash
# Cấp quyền thực thi (chỉ cần làm 1 lần)
chmod +x auto-sync.sh

# Chạy với commit message mặc định
./auto-sync.sh

# Chạy với commit message tùy chỉnh
./auto-sync.sh "feat: Add new feature XYZ"
```

#### Trên Windows (PowerShell):

```powershell
# Chạy với commit message mặc định
.\auto-sync.ps1

# Chạy với commit message tùy chỉnh
.\auto-sync.ps1 "feat: Add new feature XYZ"
```

### 🔄 Tạo Alias (Tùy chọn)

Để chạy nhanh hơn, tạo alias:

**Trên Linux/Mac (Bash/Zsh):**

Thêm vào file `~/.bashrc` hoặc `~/.zshrc`:

```bash
alias sync="cd /path/to/video-affiliate-app && ./auto-sync.sh"
```

Sau đó chỉ cần gõ:

```bash
sync
# hoặc
sync "your custom message"
```

**Trên Windows (PowerShell):**

Thêm vào PowerShell profile (`$PROFILE`):

```powershell
function sync {
    param([string]$msg = "")
    Push-Location "C:\path\to\video-affiliate-app"
    if ($msg) {
        .\auto-sync.ps1 $msg
    } else {
        .\auto-sync.ps1
    }
    Pop-Location
}
```

---

## 3. File Watcher Auto-Sync (Nâng cao)

### ✅ Ưu điểm
- Tự động phát hiện khi file thay đổi
- Sync liên tục trong khi làm việc
- Không cần nhớ chạy script thủ công

### ⚠️ Lưu ý
- Cần Node.js đã cài đặt
- Máy tính phải luôn bật và chạy script
- Tốn tài nguyên hơn các phương án khác

### 📝 Cách Sử Dụng

#### Chạy với cấu hình mặc định:

```bash
node watch-and-sync.js
```

**Cấu hình mặc định:**
- **Interval**: 300 giây (5 phút) - Thời gian chờ giữa các lần sync
- **Debounce**: 30 giây - Thời gian chờ sau khi phát hiện thay đổi file cuối cùng

#### Tùy chỉnh cấu hình:

```bash
# Sync mỗi 10 phút
node watch-and-sync.js --interval 600

# Chờ 60 giây sau thay đổi cuối cùng
node watch-and-sync.js --debounce 60

# Kết hợp cả hai
node watch-and-sync.js --interval 600 --debounce 60
```

#### Xem help:

```bash
node watch-and-sync.js --help
```

### 🔄 Chạy Trong Background

**Trên Linux/Mac:**

```bash
# Chạy trong background với nohup
nohup node watch-and-sync.js > watch-and-sync.log 2>&1 &

# Hoặc dùng screen
screen -S auto-sync
node watch-and-sync.js
# Nhấn Ctrl+A, sau đó D để detach

# Quay lại screen
screen -r auto-sync
```

**Trên Windows:**

Tạo file `start-watch-sync.vbs`:

```vbs
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c node watch-and-sync.js", 0
Set WshShell = Nothing
```

Double-click file để chạy trong background.

### 🛑 Dừng File Watcher

**Foreground process:**
- Nhấn `Ctrl+C` để dừng
- Script sẽ tự động sync thay đổi cuối cùng trước khi thoát

**Background process:**

```bash
# Tìm process ID
ps aux | grep watch-and-sync

# Kill process
kill <PID>

# Hoặc dùng pkill
pkill -f watch-and-sync
```

---

## 📊 So Sánh Các Phương Án

| Tiêu chí | GitHub Actions | Script Local | File Watcher |
|----------|----------------|--------------|--------------|
| **Tự động hoàn toàn** | ✅ Có | ❌ Không | ✅ Có |
| **Cần máy tính bật** | ❌ Không | ✅ Có | ✅ Có |
| **Tốc độ sync** | Theo lịch (6h) | Ngay lập tức | Liên tục |
| **Tùy chỉnh message** | ⚠️ Thủ công | ✅ Dễ dàng | ❌ Tự động |
| **Tài nguyên hệ thống** | Không dùng | Rất thấp | Trung bình |
| **Độ phức tạp** | Thấp | Rất thấp | Cao |
| **Khuyến nghị cho** | Hầu hết user | Quick sync | Dev làm liên tục |

---

## 🎯 Khuyến Nghị Sử Dụng

### Kịch bản 1: Developer làm việc hàng ngày
**Phối hợp GitHub Actions + Script Local:**
- GitHub Actions: Backup tự động mỗi 6 giờ
- Script Local: Sync ngay khi hoàn thành task quan trọng

```bash
# Khi hoàn thành feature
./auto-sync.sh "feat: Implement user authentication"

# Khi fix bug
./auto-sync.sh "fix: Resolve timezone issue in schedules"
```

### Kịch bản 2: Developer làm project phụ
**Chỉ dùng GitHub Actions:**
- Set cron schedule: mỗi 12 giờ hoặc mỗi ngày
- Không cần quan tâm, code tự động backup

### Kịch bản 3: Developer làm sprint intensive
**Dùng File Watcher:**
- Chạy `node watch-and-sync.js` khi bắt đầu làm
- Code liên tục được sync
- Nhấn Ctrl+C khi kết thúc ngày làm việc

---

## 🔒 Bảo Mật

### GitHub Actions
- Sử dụng `GITHUB_TOKEN` tự động (GitHub cung cấp)
- Không cần cấu hình thêm secrets
- Token có quyền giới hạn (chỉ write vào repo hiện tại)

### Script Local
- Sử dụng git credentials đã cấu hình trên máy
- Đảm bảo dùng SSH key hoặc Personal Access Token
- **Không bao giờ** commit token vào code

### File Watcher
- Giống Script Local
- Chạy local nên an toàn hơn

---

## 🐛 Troubleshooting

### Lỗi: "Failed to push after 4 attempts"

**Nguyên nhân:**
- Mất kết nối mạng
- Git credentials không đúng
- Branch bị protect
- Conflict với remote

**Giải pháp:**
```bash
# Kiểm tra kết nối
git fetch origin

# Kiểm tra credentials
git config --list | grep credential

# Pull changes từ remote trước
git pull origin <branch-name>

# Thử push thủ công
git push -u origin <branch-name>
```

### Lỗi: "Not a git repository"

**Nguyên nhân:**
- Chạy script ngoài git repository
- `.git` folder bị xóa

**Giải pháp:**
```bash
# Kiểm tra có phải git repo không
git status

# Nếu không phải, init repo
git init
git remote add origin <your-repo-url>
```

### Lỗi: GitHub Actions không chạy

**Nguyên nhân:**
- Workflow file sai cú pháp
- Repository settings tắt Actions
- Cron schedule chưa đến giờ

**Giải pháp:**
1. Vào GitHub repo > **Settings** > **Actions** > **General**
2. Chọn "Allow all actions and reusable workflows"
3. Kiểm tra file `.github/workflows/auto-sync.yml` syntax
4. Trigger thủ công để test

---

## 📚 Tài Liệu Tham Khảo

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cron Syntax Guide](https://crontab.guru/)
- [Git Push Documentation](https://git-scm.com/docs/git-push)

---

## 💡 Tips & Tricks

### 1. Commit Message Convention

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature mới
./auto-sync.sh "feat: Add dark mode toggle"

# Bug fix
./auto-sync.sh "fix: Resolve memory leak in cron service"

# Documentation
./auto-sync.sh "docs: Update API documentation"

# Refactoring
./auto-sync.sh "refactor: Simplify timezone conversion logic"

# Performance
./auto-sync.sh "perf: Optimize database queries"

# Tests
./auto-sync.sh "test: Add unit tests for auth service"
```

### 2. Gitignore Auto-generated Files

Tạo `.gitignore` để tránh commit file không cần thiết:

```
# Dependencies
node_modules/

# Build output
.next/
dist/
build/

# Logs
*.log
watch-and-sync.log

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db
```

### 3. Pre-commit Hook

Tạo file `.git/hooks/pre-commit` để kiểm tra code trước khi commit:

```bash
#!/bin/bash

# Run linter
npm run lint

# Run tests
# npm test

# If any command fails, prevent commit
if [ $? -ne 0 ]; then
    echo "❌ Pre-commit checks failed!"
    exit 1
fi

echo "✅ Pre-commit checks passed!"
```

Cấp quyền:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 🤝 Đóng Góp

Nếu bạn có ý tưởng cải thiện hệ thống auto-sync, hãy:
1. Fork repository
2. Tạo feature branch
3. Submit pull request

---

**Chúc bạn code vui vẻ! 🚀**
