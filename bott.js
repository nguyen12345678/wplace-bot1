// ==============================
// WPLACE BOT VẼ TỰ ĐỘNG
// ==============================

// Cấu hình bot
const wplaceBot = {
    isRunning: false,
    delay: 30000, // thời gian giữa 2 lần click (ms) = 30 giây
    pixels: [],   // mảng pixel ảnh (sẽ load sau)
    currentIndex: 0,
    startX: 100, // vị trí X trên canvas
    startY: 100, // vị trí Y trên canvas
    interval: null,

    // Khởi động bot
    start: function () {
        if (this.isRunning) return console.log("⚠️ Bot đã chạy rồi!");
        this.isRunning = true;
        this.currentIndex = 0;
        this.interval = setInterval(() => this.drawNextPixel(), this.delay);
        console.log("✅ Bot đã bắt đầu!");
    },

    // Dừng bot
    stop: function () {
        if (!this.isRunning) return console.log("⚠️ Bot chưa chạy!");
        clearInterval(this.interval);
        this.isRunning = false;
        console.log("⏹️ Bot đã dừng!");
    },

    // Đặt tọa độ gốc (x, y)
    setStartPosition: function (x, y) {
        this.startX = x;
        this.startY = y;
        console.log(`📍 Đặt vị trí gốc tại (${x}, ${y})`);
    },

    // Đặt tốc độ delay (ms)
    setDelay: function (ms) {
        this.delay = ms;
        if (this.isRunning) {
            clearInterval(this.interval);
            this.interval = setInterval(() => this.drawNextPixel(), this.delay);
        }
        console.log(`⚡ Tốc độ đặt thành ${ms}ms mỗi ô`);
    },

    // Load ảnh thủ công từ data pixel
    loadImageFromData: function (data, name = "Ảnh custom") {
        this.pixels = data;
        console.log(`🖼️ Đã load ảnh: ${name}, tổng ${data.length} pixel`);
    },

    // Load ảnh từ URL (PNG/JPG base64)
    async loadImageFromUrl(url, width, height) {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;

        await new Promise(res => img.onload = res);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height).data;
        let pixels = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = imgData[idx];
                const g = imgData[idx + 1];
                const b = imgData[idx + 2];
                const a = imgData[idx + 3];
                if (a > 128) { // bỏ pixel trong suốt
                    pixels.push({
                        x: this.startX + x,
                        y: this.startY + y,
                        color: `rgb(${r},${g},${b})`
                    });
                }
            }
        }

        this.loadImageFromData(pixels, url);
    },

    // Vẽ pixel tiếp theo
    drawNextPixel: function () {
        if (!this.isRunning || this.currentIndex >= this.pixels.length) {
            this.stop();
            console.log("✅ Hoàn thành vẽ ảnh!");
            return;
        }
        const p = this.pixels[this.currentIndex];
        this.currentIndex++;

        // Giả lập click trên canvas
        const canvas = document.querySelector("canvas");
        if (!canvas) return console.error("❌ Không tìm thấy canvas!");

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 1, 1);

        console.log(`🎨 Vẽ pixel ${this.currentIndex}/${this.pixels.length} tại (${p.x},${p.y}) màu ${p.color}`);
    }
};
