class Building {
    constructor(r, c, key) {
        this.r = r;
        this.c = c;
        this.key = key; // house_s, company...
        this.data = CONFIG.buildings[key];
        
        // 动态属性
        this.people = []; // 里面的人 (住户或员工)
    }

    // 获取绘制坐标 (必须实时计算，因为 offset 会变)
    get x() { return STATE.offsetX + this.c * CONFIG.tileSize; }
    get y() { return STATE.offsetY + this.r * CONFIG.tileSize; }

    draw(ctx) {
        // 1. 画背景块/图片
        if (this.data.type === 'road') {
            ctx.drawImage(ASSETS.road.complete ? ASSETS.road : this.colorBlock('#555'), this.x, this.y, CONFIG.tileSize, CONFIG.tileSize);
        } else {
            let img = ASSETS[this.data.type]; // ASSETS.house
            if (img && img.complete) {
                ctx.drawImage(img, this.x, this.y, CONFIG.tileSize, CONFIG.tileSize);
            } else {
                ctx.fillStyle = this.data.color;
                ctx.fillRect(this.x+2, this.y+2, CONFIG.tileSize-4, CONFIG.tileSize-4);
            }
        }

        // 2. 显示信息 (人数)
        if (this.data.type !== 'road') {
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            let max = this.data.capacity || this.data.jobs || 0;
            ctx.fillText(`${this.people.length}/${max}`, this.x + CONFIG.tileSize/2, this.y - 5);
        }
    }

    colorBlock(color) {
        // 简单的颜色回退逻辑，实际不用写，直接画矩形
        return { complete: false }; 
    }
}