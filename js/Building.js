class Building {
    constructor(r, c, typeKey) {
        this.r = r;
        this.c = c;
        this.typeKey = typeKey; // 'house_s', 'company_l'
        this.data = CONFIG.buildings[typeKey]; // 获取配置数据
        this.updatePos();
        
        this.occupants = []; 
        this.workers = []; // 如果是公司，存员工
    }

    updatePos() {
        this.x = STATE.offsetX + this.c * CONFIG.tileSize;
        this.y = STATE.offsetY + this.r * CONFIG.tileSize;
    }

    draw(ctx) {
        if (this.typeKey === 'road') {
            // 这里可以换成 road.png
            ctx.fillStyle = '#555';
            ctx.fillRect(this.x, this.y, CONFIG.tileSize, CONFIG.tileSize);
            return;
        }

        // 绘制建筑图片或色块
        let img = ASSETS[this.typeKey.split('_')[0]]; // house_s -> ASSETS.house
        if (img && img.complete) {
            ctx.drawImage(img, this.x, this.y, CONFIG.tileSize, CONFIG.tileSize);
        } else {
            ctx.fillStyle = this.data.color;
            ctx.fillRect(this.x+2, this.y+2, CONFIG.tileSize-4, CONFIG.tileSize-4);
        }

        // 显示容量/员工数 (简单的 UI)
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        let info = '';
        if (this.data.capacity) info = `${this.occupants.length}/${this.data.capacity}`;
        if (this.data.jobs) info = `${this.workers.length}/${this.data.jobs}`;
        ctx.fillText(info, this.x + 2, this.y + 10);
    }
}