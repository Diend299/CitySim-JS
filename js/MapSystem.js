const MapSystem = {
    grid: [], // 0=空, 1=路, 2=建筑
    buildings: [], // Building 对象列表

    init() {
        this.grid = [];
        this.buildings = [];
        STATE.rows = 5; STATE.cols = 5; // 重置大小
        
        // 生成初始 5x5 网格
        for(let r=0; r<STATE.rows; r++) this.grid.push(new Array(STATE.cols).fill(0));
        
        this.updateOffset();
        
        // 开局送路和房
        this.build(2, 0, 'road'); this.build(2, 1, 'road'); this.build(2, 2, 'road');
        this.build(2, 3, 'road'); this.build(2, 4, 'road');
        this.build(1, 2, 'house_s');
        this.build(3, 2, 'company');
    },

    updateOffset() {
        // 居中计算
        STATE.offsetX = (canvas.width - STATE.cols * CONFIG.tileSize) / 2;
        STATE.offsetY = (canvas.height - STATE.rows * CONFIG.tileSize) / 2;
    },

    // 扩建逻辑 (重点)
    expand() {
        let cost = CONFIG.expansionCost[STATE.rows];
        if (!cost) { alert("已达最大规模！"); return; }
        if (STATE.money < cost) { alert("资金不足！"); return; }

        STATE.money -= cost;
        
        // 增加行和列 (上下左右各+1)
        STATE.rows += 2;
        STATE.cols += 2;
        
        // 1. Grid 扩容
        // 每一行左右加 0
        this.grid.forEach(row => { row.unshift(0); row.push(0); });
        // 加头尾行
        this.grid.unshift(new Array(STATE.cols).fill(0));
        this.grid.push(new Array(STATE.cols).fill(0));

        // 2. 修正旧建筑坐标 (全部 +1, +1)
        this.buildings.forEach(b => { b.r++; b.c++; });

        this.updateOffset();
        Logger.add('sys', `城市扩建完成！当前规模 ${STATE.rows}x${STATE.cols}`);
        
        // 更新按钮文本
        let nextCost = CONFIG.expansionCost[STATE.rows];
        document.getElementById('btnExpand').innerText = nextCost ? `✨ 扩建 ($${nextCost/1000}k)` : '已最大';
    },

    build(r, c, key) {
        this.grid[r][c] = (key === 'road' ? 1 : 2);
        let b = new Building(r, c, key);
        this.buildings.push(b);
        return b;
    },

    draw(ctx) {
        // 1. 画背景区域 (地图底板)
        ctx.fillStyle = '#222';
        ctx.fillRect(0,0,canvas.width, canvas.height); // 清黑
        
        ctx.fillStyle = '#333'; // 地图区域
        ctx.fillRect(STATE.offsetX, STATE.offsetY, STATE.cols*CONFIG.tileSize, STATE.rows*CONFIG.tileSize);

        // 2. 画网格线
        ctx.strokeStyle = '#444';
        ctx.beginPath();
        for(let i=0; i<=STATE.rows; i++) {
            let y = STATE.offsetY + i*CONFIG.tileSize;
            ctx.moveTo(STATE.offsetX, y); ctx.lineTo(STATE.offsetX + STATE.cols*CONFIG.tileSize, y);
        }
        for(let i=0; i<=STATE.cols; i++) {
            let x = STATE.offsetX + i*CONFIG.tileSize;
            ctx.moveTo(x, STATE.offsetY); ctx.lineTo(x, STATE.offsetY + STATE.rows*CONFIG.tileSize);
        }
        ctx.stroke();

        // 3. 画建筑
        this.buildings.forEach(b => b.draw(ctx));
    },

    // 寻找空缺的建筑 (找工作/找房)
    findSpot(type) {
        // 随机打乱防止都去同一个
        let valid = this.buildings.filter(b => b.data.type === type);
        valid.sort(() => Math.random() - 0.5);

        for (let b of valid) {
            let limit = b.data.capacity || b.data.jobs;
            if (b.people.length < limit) return b;
        }
        return null;
    }
};