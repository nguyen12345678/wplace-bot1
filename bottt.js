/**
 * Bot para automatizar desenhos no wplace.live
 * Instruções:
 * 1. Abra o site wplace.live no navegador
 * 2. Abra o Console do desenvolvedor (F12 > Console)
 * 3. Cole este script e pressione Enter
 * 4. Configure sua imagem e posição inicial
 * 5. Execute o bot
 */

class WPlaceBot {
    constructor() {
        this.isRunning = false;
        this.delay = 1000; // Delay entre cliques em ms
        this.currentPixel = 0;
        this.pixels = [];
        this.startX = 0;
        this.startY = 0;
        this.canvas = null;
        this.colorPalette = [];
        this.selectedColor = '#000000';
    }

    // Inicializa o bot
    init() {
        console.log('🎨 WPlace Bot inicializado!');
        this.findCanvas();
        this.findColorPalette();
        this.createControlPanel();
    }

    // Encontra o canvas do wplace
    findCanvas() {
        // Procura por diferentes possíveis seletores do canvas
        const possibleSelectors = [
            'canvas',
            '#canvas',
            '.canvas',
            '[data-testid="canvas"]',
            'canvas[width]',
            'canvas[height]'
        ];

        for (const selector of possibleSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                this.canvas = element;
                console.log('✅ Canvas encontrado:', selector);
                return;
            }
        }

        console.error('❌ Canvas não encontrado. Certifique-se de estar no wplace.live');
    }

    // Encontra a paleta de cores
    findColorPalette() {
        // Procura por elementos que podem ser cores
        const colorElements = document.querySelectorAll('[style*="background-color"], .color, [data-color], .palette-color');
        
        colorElements.forEach(element => {
            const bgColor = window.getComputedStyle(element).backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                this.colorPalette.push({
                    element: element,
                    color: bgColor
                });
            }
        });

        console.log(`✅ Encontradas ${this.colorPalette.length} cores na paleta`);
    }

    // Converte cor RGB para HEX
    rgbToHex(rgb) {
        const result = rgb.match(/\d+/g);
        if (!result) return '#000000';
        
        const [r, g, b] = result.map(num => parseInt(num));
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Encontra a cor mais próxima na paleta
    findClosestColor(targetColor) {
        if (this.colorPalette.length === 0) return null;

        let closestColor = this.colorPalette[0];
        let minDistance = Infinity;

        // Converte cor alvo para RGB
        const target = this.hexToRgb(targetColor);
        if (!target) return closestColor;

        this.colorPalette.forEach(paletteColor => {
            const rgb = this.rgbStringToObject(paletteColor.color);
            if (rgb) {
                const distance = Math.sqrt(
                    Math.pow(target.r - rgb.r, 2) +
                    Math.pow(target.g - rgb.g, 2) +
                    Math.pow(target.b - rgb.b, 2)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    closestColor = paletteColor;
                }
            }
        });

        return closestColor;
    }

    // Converte HEX para RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Converte string RGB para objeto
    rgbStringToObject(rgb) {
        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) return null;
        
        return {
            r: parseInt(result[0]),
            g: parseInt(result[1]),
            b: parseInt(result[2])
        };
    }

    // Seleciona uma cor na paleta
    selectColor(color) {
        const closestColor = this.findClosestColor(color);
        if (closestColor && closestColor.element) {
            closestColor.element.click();
            this.selectedColor = color;
            console.log(`🎨 Cor selecionada: ${color}`);
            return true;
        }
        return false;
    }

    // Clica em uma posição específica do canvas
    clickCanvas(x, y) {
        if (!this.canvas) return false;

        const rect = this.canvas.getBoundingClientRect();
        const canvasX = x + rect.left;
        const canvasY = y + rect.top;

        // Cria eventos de mouse
        const events = ['mousedown', 'mouseup', 'click'];
        
        events.forEach(eventType => {
            const event = new MouseEvent(eventType, {
                bubbles: true,
                cancelable: true,
                clientX: canvasX,
                clientY: canvasY,
                button: 0
            });
            this.canvas.dispatchEvent(event);
        });

        console.log(`🖱️ Clicado em (${x}, ${y})`);
        return true;
    }

    // Carrega uma imagem simples (matriz de cores)
    loadSimpleImage(imageData, width, height) {
        this.pixels = [];
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                if (index < imageData.length) {
                    this.pixels.push({
                        x: x,
                        y: y,
                        color: imageData[index]
                    });
                }
            }
        }

        console.log(`📷 Imagem carregada: ${width}x${height} pixels (${this.pixels.length} pixels)`);
    }

    // Exemplo de imagem simples - um coração pequeno
    loadHeartImage() {
        const heart = [
            '⬜', '🟥', '🟥', '⬜', '🟥', '🟥', '⬜',
            '🟥', '🟥', '🟥', '🟥', '🟥', '🟥', '🟥',
            '🟥', '🟥', '🟥', '🟥', '🟥', '🟥', '🟥',
            '🟥', '🟥', '🟥', '🟥', '🟥', '🟥', '🟥',
            '⬜', '🟥', '🟥', '🟥', '🟥', '🟥', '⬜',
            '⬜', '⬜', '🟥', '🟥', '🟥', '⬜', '⬜',
            '⬜', '⬜', '⬜', '🟥', '⬜', '⬜', '⬜'
        ];

        const colorMap = {
            '🟥': '#FF0000',
            '⬜': '#FFFFFF'
        };

        const imageData = heart.map(emoji => colorMap[emoji] || '#FFFFFF');
        this.loadSimpleImage(imageData, 7, 7);
    }

    // Exemplo de imagem - smile face
    loadSmileyImage() {
        const smiley = [
            '⬜', '⬜', '🟨', '🟨', '🟨', '⬜', '⬜',
            '⬜', '🟨', '🟨', '🟨', '🟨', '🟨', '⬜',
            '🟨', '🟨', '⬛', '🟨', '⬛', '🟨', '🟨',
            '🟨', '🟨', '🟨', '🟨', '🟨', '🟨', '🟨',
            '🟨', '⬛', '🟨', '🟨', '🟨', '⬛', '🟨',
            '⬜', '🟨', '⬛', '⬛', '⬛', '🟨', '⬜',
            '⬜', '⬜', '🟨', '🟨', '🟨', '⬜', '⬜'
        ];

        const colorMap = {
            '🟨': '#FFFF00',
            '⬛': '#000000',
            '⬜': '#FFFFFF'
        };

        const imageData = smiley.map(emoji => colorMap[emoji] || '#FFFFFF');
        this.loadSimpleImage(imageData, 7, 7);
    }

    // Inicia o bot
    async start() {
        if (this.isRunning) {
            console.log('⚠️ Bot já está rodando!');
            return;
        }

        if (this.pixels.length === 0) {
            console.log('⚠️ Carregue uma imagem primeiro!');
            return;
        }

        this.isRunning = true;
        this.currentPixel = 0;
        console.log('🚀 Bot iniciado!');

        while (this.isRunning && this.currentPixel < this.pixels.length) {
            const pixel = this.pixels[this.currentPixel];
            const x = this.startX + pixel.x;
            const y = this.startY + pixel.y;

            // Seleciona a cor
            if (this.selectColor(pixel.color)) {
                // Aguarda um pouco para a cor ser selecionada
                await this.sleep(200);
                
                // Clica no canvas
                this.clickCanvas(x, y);
                
                console.log(`✅ Pixel ${this.currentPixel + 1}/${this.pixels.length} colocado em (${x}, ${y})`);
            }

            this.currentPixel++;
            
            // Aguarda antes do próximo pixel
            await this.sleep(this.delay);
        }

        this.isRunning = false;
        console.log('✅ Bot finalizado!');
    }

    // Para o bot
    stop() {
        this.isRunning = false;
        console.log('⏹️ Bot parado!');
    }

    // Função de delay
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Define posição inicial
    setStartPosition(x, y) {
        this.startX = x;
        this.startY = y;
        console.log(`📍 Posição inicial definida: (${x}, ${y})`);
    }

    // Define delay entre cliques
    setDelay(ms) {
        this.delay = ms;
        console.log(`⏱️ Delay definido: ${ms}ms`);
    }

    // Carrega imagem a partir de dados de pixels
    loadImageFromData(pixelData, name = 'Custom Image') {
        if (!Array.isArray(pixelData)) {
            console.error('❌ Dados da imagem devem ser um array de objetos {x, y, color}');
            return false;
        }

        // Validar formato dos dados
        const isValidData = pixelData.every(pixel => 
            typeof pixel === 'object' && 
            typeof pixel.x === 'number' && 
            typeof pixel.y === 'number' && 
            typeof pixel.color === 'string'
        );

        if (!isValidData) {
            console.error('❌ Formato inválido. Cada pixel deve ter {x, y, color}');
            return false;
        }

        this.pixels = pixelData.slice(); // Cópia dos dados
        console.log(`✅ ${name} carregada: ${pixelData.length} pixels`);
        
        // Calcular dimensões da imagem
        const maxX = Math.max(...pixelData.map(p => p.x));
        const maxY = Math.max(...pixelData.map(p => p.y));
        console.log(`📐 Dimensões: ${maxX + 1}x${maxY + 1} pixels`);
        
        // Contar cores únicas
        const uniqueColors = [...new Set(pixelData.map(p => p.color))];
        console.log(`🎨 Cores únicas: ${uniqueColors.length}`);

        return true;
    }

    // Carrega imagem a partir de URL de dados (data URL)
    async loadImageFromUrl(imageUrl, maxWidth = 50, maxHeight = 50) {
        try {
            console.log('🔄 Carregando imagem da URL...');
            
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            return new Promise((resolve, reject) => {
                img.onload = () => {
                    try {
                        const pixelData = this.processImageToPixels(img, maxWidth, maxHeight);
                        this.loadImageFromData(pixelData, 'Image from URL');
                        resolve(true);
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = () => {
                    reject(new Error('Erro ao carregar imagem da URL'));
                };
                
                img.src = imageUrl;
            });
        } catch (error) {
            console.error('❌ Erro ao carregar imagem:', error);
            return false;
        }
    }

    // Processa uma imagem HTML para dados de pixels
    processImageToPixels(img, maxWidth, maxHeight) {
        // Calcular dimensões mantendo proporção
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        const width = Math.floor(img.width * scale);
        const height = Math.floor(img.height * scale);

        // Criar canvas temporário
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, width, height);

        // Obter dados dos pixels
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const pixels = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];

                // Ignorar pixels transparentes
                if (a < 128) continue;

                const color = '#' + [r, g, b].map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('');

                pixels.push({ x, y, color });
            }
        }

        return pixels;
    }

    // Cria painel de controle
    createControlPanel() {
        // Remove painel anterior se existir
        const existingPanel = document.getElementById('wplace-bot-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const panel = document.createElement('div');
        panel.id = 'wplace-bot-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #2c2c2c;
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            z-index: 10000;
            width: 250px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;

        panel.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #4CAF50;">🎨 WPlace Bot</h3>
            <div style="margin-bottom: 10px;">
                <label>Posição X: <input type="number" id="startX" value="100" style="width: 60px;"></label>
                <label>Posição Y: <input type="number" id="startY" value="100" style="width: 60px;"></label>
            </div>
            <div style="margin-bottom: 10px;">
                <label>Delay (ms): <input type="number" id="delay" value="1000" style="width: 80px;"></label>
            </div>
            <div style="margin-bottom: 10px;">
                <button id="loadHeart" style="margin-right: 5px; margin-bottom: 5px;">❤️ Coração</button>
                <button id="loadSmiley" style="margin-bottom: 5px;">😊 Smiley</button>
            </div>
            <div style="margin-bottom: 10px;">
                <input type="file" id="imageInput" accept="image/*" style="display: none;">
                <button id="loadCustom" style="background: #FF9800; color: white; border: none; padding: 6px 10px; border-radius: 4px; margin-right: 5px; margin-bottom: 5px; font-size: 11px;">📁 Carregar Imagem</button>
                <button id="openConverter" style="background: #9C27B0; color: white; border: none; padding: 6px 10px; border-radius: 4px; margin-right: 5px; margin-bottom: 5px; font-size: 11px;">🔧 Conversor</button>
                <button id="openEditor" style="background: #E91E63; color: white; border: none; padding: 6px 10px; border-radius: 4px; margin-bottom: 5px; font-size: 11px;">🎨 Editor</button>
            </div>
            <div style="margin-bottom: 10px;">
                <button id="startBot" style="background: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 4px; margin-right: 5px;">▶️ Iniciar</button>
                <button id="stopBot" style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 4px;">⏹️ Parar</button>
            </div>
            <div id="status" style="font-size: 11px; color: #ccc;">
                Status: Pronto
            </div>
        `;

        document.body.appendChild(panel);

        // Event listeners
        document.getElementById('startX').addEventListener('input', (e) => {
            this.setStartPosition(parseInt(e.target.value) || 0, this.startY);
        });

        document.getElementById('startY').addEventListener('input', (e) => {
            this.setStartPosition(this.startX, parseInt(e.target.value) || 0);
        });

        document.getElementById('delay').addEventListener('input', (e) => {
            this.setDelay(parseInt(e.target.value) || 1000);
        });

        document.getElementById('loadHeart').addEventListener('click', () => {
            this.loadHeartImage();
            document.getElementById('status').textContent = 'Status: Coração carregado';
        });

        document.getElementById('loadSmiley').addEventListener('click', () => {
            this.loadSmileyImage();
            document.getElementById('status').textContent = 'Status: Smiley carregado';
        });

        document.getElementById('startBot').addEventListener('click', () => {
            this.start();
            document.getElementById('status').textContent = 'Status: Executando...';
        });

        document.getElementById('stopBot').addEventListener('click', () => {
            this.stop();
            document.getElementById('status').textContent = 'Status: Parado';
        });

        document.getElementById('loadCustom').addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });

        document.getElementById('imageInput').addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                try {
                    document.getElementById('status').textContent = 'Status: Carregando imagem...';
                    
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        try {
                            await this.loadImageFromUrl(event.target.result, 50, 50);
                            document.getElementById('status').textContent = 'Status: Imagem carregada!';
                        } catch (error) {
                            console.error('Erro ao processar imagem:', error);
                            document.getElementById('status').textContent = 'Status: Erro ao carregar imagem';
                        }
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    console.error('Erro ao ler arquivo:', error);
                    document.getElementById('status').textContent = 'Status: Erro ao ler arquivo';
                }
            }
        });

        document.getElementById('openConverter').addEventListener('click', () => {
            const converterPath = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'image-converter.html';
            window.open(converterPath, '_blank');
        });

        document.getElementById('openEditor').addEventListener('click', () => {
            const editorPath = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'pixel-editor.html';
            window.open(editorPath, '_blank');
        });
    }
}

// Inicializa o bot
const wplaceBot = new WPlaceBot();
wplaceBot.init();

// Comandos disponíveis no console:
console.log(`
🎨 WPlace Bot Carregado! 

Comandos disponíveis:
- wplaceBot.setStartPosition(x, y) - Define posição inicial
- wplaceBot.setDelay(ms) - Define delay entre cliques  
- wplaceBot.loadHeartImage() - Carrega imagem de coração
- wplaceBot.loadSmileyImage() - Carrega imagem de smiley
- wplaceBot.loadImageFromData(pixelData, name) - Carrega imagem de dados
- wplaceBot.loadImageFromUrl(url, maxWidth, maxHeight) - Carrega imagem de URL
- wplaceBot.start() - Inicia o bot
- wplaceBot.stop() - Para o bot

🔧 Conversor de Imagem:
Use o painel de controle ou abra image-converter.html para converter suas próprias imagens!

Ou use o painel de controle que apareceu no canto superior direito!
`);
